package com.cyber.auth.dto;

public class UserStatusRequest {
    private boolean enabled;

    public UserStatusRequest() {
    }

    public UserStatusRequest(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
