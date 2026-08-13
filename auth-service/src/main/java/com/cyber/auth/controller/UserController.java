package com.cyber.auth.controller;

import com.cyber.auth.dto.*;
import com.cyber.auth.model.*;
import com.cyber.auth.repository.AuditLogRepository;
import com.cyber.auth.repository.RoleRepository;
import com.cyber.auth.repository.UserRepository;
import com.cyber.auth.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "User Management & Audit API", description = "Endpoints for user administration, hierarchical role promotion, and audit logging")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateJwtToken(token)) {
                String username = jwtUtils.getUserNameFromJwtToken(token);
                return userRepository.findByUsername(username).orElse(null);
            }
        }
        return null;
    }

    private List<String> getUserPermissions(User user) {
        Set<String> perms = new HashSet<>();
        for (Role role : user.getRoles()) {
            for (Permission p : role.getPermissions()) {
                perms.add(p.getName().name());
            }
        }
        return new ArrayList<>(perms);
    }

    private boolean hasPermission(User user, EPermission permission) {
        if (user == null) return false;
        return user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .anyMatch(p -> p.getName() == permission);
    }

    private boolean isRole(User user, ERole roleEnum) {
        if (user == null) return false;
        return user.getRoles().stream().anyMatch(r -> r.getName() == roleEnum);
    }

    @Operation(summary = "List All Users", description = "Retrieves all registered users with their roles and status")
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User actor = getAuthenticatedUser(authHeader);
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        if (!hasPermission(actor, EPermission.VIEW_USERS) && !isRole(actor, ERole.ROLE_ADMIN) && !isRole(actor, ERole.ROLE_SOC_MANAGER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Requires VIEW_USERS permission");
        }

        List<User> users = userRepository.findAll();
        List<UserProfileResponse> responseList = users.stream().map(u -> {
            List<String> roles = u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
            List<String> perms = getUserPermissions(u);
            return new UserProfileResponse(u.getId(), u.getUsername(), u.getEmail(), u.isEnabled(), roles, perms);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @Operation(summary = "Get User Details", description = "Retrieves profile details for a specific user ID")
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User actor = getAuthenticatedUser(authHeader);
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        User target = userRepository.findById(id).orElse(null);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        List<String> roles = target.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
        List<String> perms = getUserPermissions(target);
        return ResponseEntity.ok(new UserProfileResponse(target.getId(), target.getUsername(), target.getEmail(), target.isEnabled(), roles, perms));
    }

    @Operation(summary = "Promote / Reassign User Role", description = "Promotes or reassigns a user's role subject to hierarchical authority validation")
    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUser(
            @PathVariable Long id,
            @RequestBody PromoteRequest promoteRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User actor = getAuthenticatedUser(authHeader);
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        User target = userRepository.findById(id).orElse(null);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Target user not found");
        }

        boolean isAdmin = isRole(actor, ERole.ROLE_ADMIN);
        boolean isManager = isRole(actor, ERole.ROLE_SOC_MANAGER);

        if (!isAdmin && !isManager && !hasPermission(actor, EPermission.PROMOTE_USER)) {
            auditLogRepository.save(new AuditLog(actor.getUsername(), target.getUsername(), "PROMOTE_USER",
                    target.getRoles().isEmpty() ? "NONE" : target.getRoles().iterator().next().getName().name(),
                    promoteRequest.getNewRole(), "DENIED_INSUFFICIENT_PERMISSIONS", "127.0.0.1"));
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You do not have privilege to promote users");
        }

        // Validate requested role
        String newRoleStr = promoteRequest.getNewRole();
        if (!newRoleStr.startsWith("ROLE_")) {
            newRoleStr = "ROLE_" + newRoleStr;
        }

        ERole targetEnum;
        try {
            targetEnum = ERole.valueOf(newRoleStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified: " + promoteRequest.getNewRole());
        }

        // HIERARCHY VALIDATION RULES:
        // SOC_MANAGER CANNOT:
        // 1. Assign ROLE_ADMIN or ROLE_SOC_MANAGER
        // 2. Modify an existing ADMIN account
        boolean targetIsAdmin = isRole(target, ERole.ROLE_ADMIN);
        if (isManager && !isAdmin) {
            if (targetIsAdmin) {
                auditLogRepository.save(new AuditLog(actor.getUsername(), target.getUsername(), "PROMOTE_USER",
                        "ROLE_ADMIN", targetEnum.name(), "DENIED_CANNOT_MODIFY_ADMIN", "127.0.0.1"));
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("SOC Managers cannot modify Admin accounts");
            }
            if (targetEnum == ERole.ROLE_ADMIN || targetEnum == ERole.ROLE_SOC_MANAGER) {
                auditLogRepository.save(new AuditLog(actor.getUsername(), target.getUsername(), "PROMOTE_USER",
                        target.getRoles().isEmpty() ? "NONE" : target.getRoles().iterator().next().getName().name(),
                        targetEnum.name(), "DENIED_HIERARCHY_VIOLATION", "127.0.0.1"));
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("SOC Managers can only assign operational roles (SOC_ANALYST, THREAT_HUNTER, INCIDENT_RESPONDER, SECURITY_AUDITOR)");
            }
        }

        String prevRoleStr = target.getRoles().isEmpty() ? "NONE" : target.getRoles().iterator().next().getName().name();

        // Assign new role
        Role newRoleObj = roleRepository.findByName(targetEnum)
                .orElseGet(() -> roleRepository.save(new Role(targetEnum)));

        Set<Role> rolesSet = new HashSet<>();
        rolesSet.add(newRoleObj);
        target.setRoles(rolesSet);
        userRepository.save(target);

        // Record Audit Log
        auditLogRepository.save(new AuditLog(actor.getUsername(), target.getUsername(), "ROLE_CHANGE", prevRoleStr, targetEnum.name(), "SUCCESS", "127.0.0.1"));

        List<String> updatedRoles = target.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
        List<String> updatedPerms = getUserPermissions(target);

        return ResponseEntity.ok(new UserProfileResponse(target.getId(), target.getUsername(), target.getEmail(), target.isEnabled(), updatedRoles, updatedPerms));
    }

    @Operation(summary = "Demote User Role", description = "Demotes a user's role to standard SOC_ANALYST")
    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demoteUser(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        PromoteRequest req = new PromoteRequest("ROLE_SOC_ANALYST");
        return promoteUser(id, req, authHeader);
    }

    @Operation(summary = "Enable / Disable User Account", description = "Toggles user account active status")
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusRequest statusRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User actor = getAuthenticatedUser(authHeader);
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        if (!isRole(actor, ERole.ROLE_ADMIN) && !hasPermission(actor, EPermission.ENABLE_USER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Only Administrators can toggle account status");
        }

        User target = userRepository.findById(id).orElse(null);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        target.setEnabled(statusRequest.isEnabled());
        userRepository.save(target);

        String action = statusRequest.isEnabled() ? "ENABLE_ACCOUNT" : "DISABLE_ACCOUNT";
        auditLogRepository.save(new AuditLog(actor.getUsername(), target.getUsername(), action, "N/A", "N/A", "SUCCESS", "127.0.0.1"));

        List<String> roles = target.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
        List<String> perms = getUserPermissions(target);
        return ResponseEntity.ok(new UserProfileResponse(target.getId(), target.getUsername(), target.getEmail(), target.isEnabled(), roles, perms));
    }

    @Operation(summary = "List Audit Logs", description = "Retrieves full system audit logs for administrative or auditor review")
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User actor = getAuthenticatedUser(authHeader);
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        if (!hasPermission(actor, EPermission.VIEW_AUDIT_LOG) && !isRole(actor, ERole.ROLE_ADMIN) && !isRole(actor, ERole.ROLE_SECURITY_AUDITOR)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Requires VIEW_AUDIT_LOG permission");
        }

        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
    }
}
