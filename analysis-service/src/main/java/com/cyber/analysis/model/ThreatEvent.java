package com.cyber.analysis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "threat_event", indexes = {
        @Index(name = "idx_threat_batch_id", columnList = "batch_id"),
        @Index(name = "idx_threat_severity", columnList = "severity"),
        @Index(name = "idx_threat_prediction", columnList = "prediction"),
        @Index(name = "idx_threat_client_ip", columnList = "client_ip"),
        @Index(name = "idx_threat_domain", columnList = "domain")
})
public class ThreatEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "timestamp")
    private String timestamp;

    @Column(name = "client_ip", length = 45)
    private String clientIp;

    @Column(name = "destination_url", columnDefinition = "TEXT")
    private String destinationUrl;

    @Column(name = "domain", length = 255)
    private String domain;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "prediction", length = 50)
    private String prediction;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "severity", length = 20)
    private String severity;

    @Column(name = "beacon_score")
    private Double beaconScore;

    @Column(name = "domain_reputation")
    private Integer domainReputation;

    @Column(name = "domain_age_days")
    private Integer domainAgeDays;

    @Column(name = "mitre_id", length = 20)
    private String mitreId;

    @Column(name = "mitre_name", length = 100)
    private String mitreName;

    @Column(name = "containment_status", length = 30)
    private String containmentStatus = "Active";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ThreatEvent() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.containmentStatus == null) {
            this.containmentStatus = "Active";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }
    public String getDestinationUrl() { return destinationUrl; }
    public void setDestinationUrl(String destinationUrl) { this.destinationUrl = destinationUrl; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getHttpMethod() { return httpMethod; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }
    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }
    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Double getBeaconScore() { return beaconScore; }
    public void setBeaconScore(Double beaconScore) { this.beaconScore = beaconScore; }
    public Integer getDomainReputation() { return domainReputation; }
    public void setDomainReputation(Integer domainReputation) { this.domainReputation = domainReputation; }
    public Integer getDomainAgeDays() { return domainAgeDays; }
    public void setDomainAgeDays(Integer domainAgeDays) { this.domainAgeDays = domainAgeDays; }
    public String getMitreId() { return mitreId; }
    public void setMitreId(String mitreId) { this.mitreId = mitreId; }
    public String getMitreName() { return mitreName; }
    public void setMitreName(String mitreName) { this.mitreName = mitreName; }
    public String getContainmentStatus() { return containmentStatus; }
    public void setContainmentStatus(String containmentStatus) { this.containmentStatus = containmentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ThreatEventBuilder builder() {
        return new ThreatEventBuilder();
    }

    public static class ThreatEventBuilder {
        private ThreatEvent t = new ThreatEvent();

        public ThreatEventBuilder id(Long id) { t.id = id; return this; }
        public ThreatEventBuilder batchId(Long batchId) { t.batchId = batchId; return this; }
        public ThreatEventBuilder timestamp(String timestamp) { t.timestamp = timestamp; return this; }
        public ThreatEventBuilder clientIp(String clientIp) { t.clientIp = clientIp; return this; }
        public ThreatEventBuilder destinationUrl(String destinationUrl) { t.destinationUrl = destinationUrl; return this; }
        public ThreatEventBuilder domain(String domain) { t.domain = domain; return this; }
        public ThreatEventBuilder httpMethod(String httpMethod) { t.httpMethod = httpMethod; return this; }
        public ThreatEventBuilder statusCode(Integer statusCode) { t.statusCode = statusCode; return this; }
        public ThreatEventBuilder prediction(String prediction) { t.prediction = prediction; return this; }
        public ThreatEventBuilder confidence(Double confidence) { t.confidence = confidence; return this; }
        public ThreatEventBuilder riskScore(Integer riskScore) { t.riskScore = riskScore; return this; }
        public ThreatEventBuilder severity(String severity) { t.severity = severity; return this; }
        public ThreatEventBuilder beaconScore(Double beaconScore) { t.beaconScore = beaconScore; return this; }
        public ThreatEventBuilder domainReputation(Integer domainReputation) { t.domainReputation = domainReputation; return this; }
        public ThreatEventBuilder domainAgeDays(Integer domainAgeDays) { t.domainAgeDays = domainAgeDays; return this; }
        public ThreatEventBuilder mitreId(String mitreId) { t.mitreId = mitreId; return this; }
        public ThreatEventBuilder mitreName(String mitreName) { t.mitreName = mitreName; return this; }
        public ThreatEventBuilder containmentStatus(String status) { t.containmentStatus = status; return this; }
        public ThreatEventBuilder createdAt(LocalDateTime createdAt) { t.createdAt = createdAt; return this; }

        public ThreatEvent build() { return t; }
    }
}

