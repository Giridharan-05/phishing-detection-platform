package com.cyber.analysis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "containment_action")
public class ContainmentAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "threat_event_id", nullable = false)
    private Long threatEventId;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "action_type", length = 50)
    private String actionType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ContainmentAction() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "RECOMMENDED";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getThreatEventId() { return threatEventId; }
    public void setThreatEventId(Long threatEventId) { this.threatEventId = threatEventId; }
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ContainmentActionBuilder builder() {
        return new ContainmentActionBuilder();
    }

    public static class ContainmentActionBuilder {
        private ContainmentAction c = new ContainmentAction();

        public ContainmentActionBuilder id(Long id) { c.id = id; return this; }
        public ContainmentActionBuilder threatEventId(Long threatEventId) { c.threatEventId = threatEventId; return this; }
        public ContainmentActionBuilder batchId(Long batchId) { c.batchId = batchId; return this; }
        public ContainmentActionBuilder actionType(String actionType) { c.actionType = actionType; return this; }
        public ContainmentActionBuilder description(String description) { c.description = description; return this; }
        public ContainmentActionBuilder priority(String priority) { c.priority = priority; return this; }
        public ContainmentActionBuilder status(String status) { c.status = status; return this; }
        public ContainmentActionBuilder createdAt(LocalDateTime createdAt) { c.createdAt = createdAt; return this; }

        public ContainmentAction build() { return c; }
    }
}
