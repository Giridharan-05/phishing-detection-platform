package com.cyber.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actorUsername;

    @Column(nullable = false)
    private String targetUsername;

    @Column(nullable = false)
    private String action;

    private String previousRole;

    private String newRole;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String result;

    private String ipAddress;

    public AuditLog() {
    }

    public AuditLog(String actorUsername, String targetUsername, String action, String previousRole, String newRole, String result, String ipAddress) {
        this.actorUsername = actorUsername;
        this.targetUsername = targetUsername;
        this.action = action;
        this.previousRole = previousRole;
        this.newRole = newRole;
        this.timestamp = LocalDateTime.now();
        this.result = result;
        this.ipAddress = ipAddress;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActorUsername() {
        return actorUsername;
    }

    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }

    public String getTargetUsername() {
        return targetUsername;
    }

    public void setTargetUsername(String targetUsername) {
        this.targetUsername = targetUsername;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getPreviousRole() {
        return previousRole;
    }

    public void setPreviousRole(String previousRole) {
        this.previousRole = previousRole;
    }

    public String getNewRole() {
        return newRole;
    }

    public void setNewRole(String newRole) {
        this.newRole = newRole;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
