package com.cyber.auth.config;

import com.cyber.auth.model.*;
import com.cyber.auth.repository.PermissionRepository;
import com.cyber.auth.repository.RoleRepository;
import com.cyber.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Fix column length and enabled flags in MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE roles MODIFY COLUMN name VARCHAR(50);");
            jdbcTemplate.execute("UPDATE users SET enabled = 1;");
        } catch (Exception ignored) {}

        // 1. Seed Permissions
        Map<EPermission, Permission> permissionMap = new HashMap<>();
        for (EPermission ePerm : EPermission.values()) {
            Permission perm = permissionRepository.findByName(ePerm)
                    .orElseGet(() -> permissionRepository.save(new Permission(ePerm)));
            permissionMap.put(ePerm, perm);
        }

        // Helper to collect permissions
        java.util.function.Function<List<EPermission>, Set<Permission>> getPermSet = ePerms -> {
            Set<Permission> set = new HashSet<>();
            for (EPermission p : ePerms) {
                if (permissionMap.containsKey(p)) {
                    set.add(permissionMap.get(p));
                }
            }
            return set;
        };

        // 2. Define Role-Permission Mappings
        Set<Permission> adminPerms = new HashSet<>(permissionMap.values());

        Set<Permission> managerPerms = getPermSet.apply(Arrays.asList(
                EPermission.VIEW_DASHBOARD, EPermission.VIEW_ANALYTICS, EPermission.VIEW_THREATS,
                EPermission.VIEW_HISTORY, EPermission.VIEW_MITRE, EPermission.GENERATE_REPORT,
                EPermission.UPLOAD_LOG, EPermission.RUN_ANALYSIS, EPermission.INVESTIGATE_IOC,
                EPermission.VIEW_BEACONING, EPermission.VIEW_DOMAIN_INTELLIGENCE, EPermission.VIEW_ATTACK_TIMELINE,
                EPermission.MANAGE_INCIDENT, EPermission.RESOLVE_INCIDENT, EPermission.VIEW_USERS,
                EPermission.PROMOTE_USER, EPermission.DEMOTE_USER
        ));

        Set<Permission> analystPerms = getPermSet.apply(Arrays.asList(
                EPermission.VIEW_DASHBOARD, EPermission.VIEW_ANALYTICS, EPermission.VIEW_THREATS,
                EPermission.VIEW_HISTORY, EPermission.VIEW_MITRE, EPermission.GENERATE_REPORT,
                EPermission.UPLOAD_LOG, EPermission.RUN_ANALYSIS
        ));

        Set<Permission> threatHunterPerms = getPermSet.apply(Arrays.asList(
                EPermission.VIEW_DASHBOARD, EPermission.VIEW_ANALYTICS, EPermission.VIEW_THREATS,
                EPermission.VIEW_HISTORY, EPermission.VIEW_MITRE, EPermission.GENERATE_REPORT,
                EPermission.UPLOAD_LOG, EPermission.RUN_ANALYSIS, EPermission.INVESTIGATE_IOC,
                EPermission.VIEW_BEACONING, EPermission.VIEW_DOMAIN_INTELLIGENCE, EPermission.VIEW_ATTACK_TIMELINE
        ));

        Set<Permission> incidentResponderPerms = getPermSet.apply(Arrays.asList(
                EPermission.VIEW_DASHBOARD, EPermission.VIEW_ANALYTICS, EPermission.VIEW_THREATS,
                EPermission.VIEW_HISTORY, EPermission.VIEW_MITRE, EPermission.GENERATE_REPORT,
                EPermission.UPLOAD_LOG, EPermission.RUN_ANALYSIS, EPermission.BLOCK_URL,
                EPermission.BLOCK_DOMAIN, EPermission.BLOCK_IP, EPermission.ISOLATE_HOST,
                EPermission.MANAGE_INCIDENT, EPermission.RESOLVE_INCIDENT
        ));

        Set<Permission> auditorPerms = getPermSet.apply(Arrays.asList(
                EPermission.VIEW_DASHBOARD, EPermission.VIEW_THREATS, EPermission.VIEW_HISTORY,
                EPermission.VIEW_MITRE, EPermission.GENERATE_REPORT, EPermission.VIEW_AUDIT_LOG,
                EPermission.VIEW_USERS
        ));

        // 3. Seed Roles & Assign Permissions
        Map<ERole, Set<Permission>> rolePermMapping = Map.of(
                ERole.ROLE_ADMIN, adminPerms,
                ERole.ROLE_SOC_MANAGER, managerPerms,
                ERole.ROLE_SOC_ANALYST, analystPerms,
                ERole.ROLE_THREAT_HUNTER, threatHunterPerms,
                ERole.ROLE_INCIDENT_RESPONDER, incidentResponderPerms,
                ERole.ROLE_SECURITY_AUDITOR, auditorPerms
        );

        for (Map.Entry<ERole, Set<Permission>> entry : rolePermMapping.entrySet()) {
            Role role = roleRepository.findByName(entry.getKey())
                    .orElseGet(() -> new Role(entry.getKey()));
            role.setPermissions(entry.getValue());
            roleRepository.save(role);
        }

        // 4. Seed Initial ADMIN Account & Default User Roles
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));

        Role analystRole = roleRepository.findByName(ERole.ROLE_SOC_ANALYST)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_SOC_ANALYST)));

        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .username("admin")
                    .email("admin@soc.cyber")
                    .password(passwordEncoder.encode("admin123"))
                    .enabled(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(admin);
            System.out.println(">>> SEEDED INITIAL ADMIN ACCOUNT (username: admin, password: admin123)");
        } else {
            admin.setEnabled(true);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }

        User vishwa = userRepository.findByUsername("vishwa").orElse(null);
        if (vishwa == null) {
            vishwa = User.builder()
                    .username("vishwa")
                    .email("717824f361@kce.ac.in")
                    .password(passwordEncoder.encode("giri"))
                    .enabled(true)
                    .roles(Set.of(analystRole))
                    .build();
            userRepository.save(vishwa);
            System.out.println(">>> SEEDED SOC ANALYST ACCOUNT (username: vishwa, password: giri)");
        } else {
            vishwa.setEmail("717824f361@kce.ac.in");
            vishwa.setPassword(passwordEncoder.encode("giri"));
            vishwa.setEnabled(true);
            vishwa.setRoles(Set.of(analystRole));
            userRepository.save(vishwa);
        }
    }
}
