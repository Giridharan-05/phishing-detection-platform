package com.cyber.auth.controller;

import com.cyber.auth.dto.*;
import com.cyber.auth.model.ERole;
import com.cyber.auth.model.Permission;
import com.cyber.auth.model.Role;
import com.cyber.auth.model.User;
import com.cyber.auth.repository.RoleRepository;
import com.cyber.auth.repository.UserRepository;
import com.cyber.auth.security.JwtUtils;
import com.cyber.auth.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication API", description = "Endpoints for user registration, login, token refresh, and user profile management")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    private List<String> extractUserPermissions(User user) {
        Set<String> perms = new HashSet<>();
        if (user != null && user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                if (role.getPermissions() != null) {
                    for (Permission p : role.getPermissions()) {
                        perms.add(p.getName().name());
                    }
                }
            }
        }
        return new ArrayList<>(perms);
    }

    @Operation(summary = "User Login", description = "Authenticates user credentials and returns a JWT access token with role and permission claims")
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (user != null && !user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Account is disabled. Contact your administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        List<String> permissions = extractUserPermissions(user);

        return ResponseEntity.ok(new JwtResponse(jwt, "Bearer", userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), roles, permissions));
    }

    @Operation(summary = "User Registration", description = "Registers a new user account with mandatory default ROLE_SOC_ANALYST (assigned server-side)")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .enabled(true)
                .build();

        // PUBLIC REGISTRATION RULE: Always assign default ROLE_SOC_ANALYST server-side
        Role defaultRole = roleRepository.findByName(ERole.ROLE_SOC_ANALYST)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_SOC_ANALYST)));

        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully with default role ROLE_SOC_ANALYST!");
    }

    @Operation(summary = "Get User Profile", description = "Retrieves the user profile and assigned permissions associated with the Bearer JWT token", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateJwtToken(token)) {
                String username = jwtUtils.getUserNameFromJwtToken(token);
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
                    List<String> permissions = extractUserPermissions(user);
                    return ResponseEntity.ok(new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.isEnabled(), roles, permissions));
                }
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing Authorization header");
    }

    @Operation(summary = "Refresh JWT Token", description = "Generates a new JWT token using an active Bearer JWT token", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateJwtToken(token)) {
                String username = jwtUtils.getUserNameFromJwtToken(token);
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null && user.isEnabled()) {
                    UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    String newToken = jwtUtils.generateJwtToken(authentication);
                    List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
                    List<String> permissions = extractUserPermissions(user);
                    return ResponseEntity.ok(new JwtResponse(newToken, "Bearer", user.getId(), user.getUsername(), user.getEmail(), roles, permissions));
                }
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token refresh failed");
    }
}
