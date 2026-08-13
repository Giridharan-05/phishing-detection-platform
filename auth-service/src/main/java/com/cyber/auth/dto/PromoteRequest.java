package com.cyber.auth.dto;

public class PromoteRequest {
    private String newRole;

    public PromoteRequest() {
    }

    public PromoteRequest(String newRole) {
        this.newRole = newRole;
    }

    public String getNewRole() {
        return newRole;
    }

    public void setNewRole(String newRole) {
        this.newRole = newRole;
    }
}
