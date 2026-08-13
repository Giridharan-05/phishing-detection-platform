package com.cyber.analysis.dto;

import java.util.List;

public class AnalysisSummaryResponse {
    private Long analysisId;
    private String filename;
    private String status;
    private Integer totalEvents;
    private Integer benignCount;
    private Integer maliciousCount;
    private Integer phishingCount;
    private Integer c2Count;
    private Integer malwareCount;
    private Integer exfiltrationCount;
    private Integer criticalCount;
    private Integer highCount;
    private Integer mediumCount;
    private Integer lowCount;
    private Double maliciousPercentage;
    private String processingDuration;
    private String modelName;
    private String modelVersion;
    private List<ThreatEventDetail> threatEvents;

    public AnalysisSummaryResponse() {
    }

    public Long getAnalysisId() { return analysisId; }
    public void setAnalysisId(Long analysisId) { this.analysisId = analysisId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalEvents() { return totalEvents; }
    public void setTotalEvents(Integer totalEvents) { this.totalEvents = totalEvents; }
    public Integer getBenignCount() { return benignCount; }
    public void setBenignCount(Integer benignCount) { this.benignCount = benignCount; }
    public Integer getMaliciousCount() { return maliciousCount; }
    public void setMaliciousCount(Integer maliciousCount) { this.maliciousCount = maliciousCount; }
    public Integer getPhishingCount() { return phishingCount; }
    public void setPhishingCount(Integer phishingCount) { this.phishingCount = phishingCount; }
    public Integer getC2Count() { return c2Count; }
    public void setC2Count(Integer c2Count) { this.c2Count = c2Count; }
    public Integer getMalwareCount() { return malwareCount; }
    public void setMalwareCount(Integer malwareCount) { this.malwareCount = malwareCount; }
    public Integer getExfiltrationCount() { return exfiltrationCount; }
    public void setExfiltrationCount(Integer exfiltrationCount) { this.exfiltrationCount = exfiltrationCount; }
    public Integer getCriticalCount() { return criticalCount; }
    public void setCriticalCount(Integer criticalCount) { this.criticalCount = criticalCount; }
    public Integer getHighCount() { return highCount; }
    public void setHighCount(Integer highCount) { this.highCount = highCount; }
    public Integer getMediumCount() { return mediumCount; }
    public void setMediumCount(Integer mediumCount) { this.mediumCount = mediumCount; }
    public Integer getLowCount() { return lowCount; }
    public void setLowCount(Integer lowCount) { this.lowCount = lowCount; }
    public Double getMaliciousPercentage() { return maliciousPercentage; }
    public void setMaliciousPercentage(Double maliciousPercentage) { this.maliciousPercentage = maliciousPercentage; }
    public String getProcessingDuration() { return processingDuration; }
    public void setProcessingDuration(String processingDuration) { this.processingDuration = processingDuration; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public List<ThreatEventDetail> getThreatEvents() { return threatEvents; }
    public void setThreatEvents(List<ThreatEventDetail> threatEvents) { this.threatEvents = threatEvents; }

    public static AnalysisSummaryResponseBuilder builder() {
        return new AnalysisSummaryResponseBuilder();
    }

    public static class AnalysisSummaryResponseBuilder {
        private AnalysisSummaryResponse r = new AnalysisSummaryResponse();

        public AnalysisSummaryResponseBuilder analysisId(Long analysisId) { r.analysisId = analysisId; return this; }
        public AnalysisSummaryResponseBuilder filename(String filename) { r.filename = filename; return this; }
        public AnalysisSummaryResponseBuilder status(String status) { r.status = status; return this; }
        public AnalysisSummaryResponseBuilder totalEvents(Integer totalEvents) { r.totalEvents = totalEvents; return this; }
        public AnalysisSummaryResponseBuilder benignCount(Integer benignCount) { r.benignCount = benignCount; return this; }
        public AnalysisSummaryResponseBuilder maliciousCount(Integer maliciousCount) { r.maliciousCount = maliciousCount; return this; }
        public AnalysisSummaryResponseBuilder phishingCount(Integer phishingCount) { r.phishingCount = phishingCount; return this; }
        public AnalysisSummaryResponseBuilder c2Count(Integer c2Count) { r.c2Count = c2Count; return this; }
        public AnalysisSummaryResponseBuilder malwareCount(Integer malwareCount) { r.malwareCount = malwareCount; return this; }
        public AnalysisSummaryResponseBuilder exfiltrationCount(Integer exfiltrationCount) { r.exfiltrationCount = exfiltrationCount; return this; }
        public AnalysisSummaryResponseBuilder criticalCount(Integer criticalCount) { r.criticalCount = criticalCount; return this; }
        public AnalysisSummaryResponseBuilder highCount(Integer highCount) { r.highCount = highCount; return this; }
        public AnalysisSummaryResponseBuilder mediumCount(Integer mediumCount) { r.mediumCount = mediumCount; return this; }
        public AnalysisSummaryResponseBuilder lowCount(Integer lowCount) { r.lowCount = lowCount; return this; }
        public AnalysisSummaryResponseBuilder maliciousPercentage(Double maliciousPercentage) { r.maliciousPercentage = maliciousPercentage; return this; }
        public AnalysisSummaryResponseBuilder processingDuration(String processingDuration) { r.processingDuration = processingDuration; return this; }
        public AnalysisSummaryResponseBuilder modelName(String modelName) { r.modelName = modelName; return this; }
        public AnalysisSummaryResponseBuilder modelVersion(String modelVersion) { r.modelVersion = modelVersion; return this; }
        public AnalysisSummaryResponseBuilder threatEvents(List<ThreatEventDetail> threatEvents) { r.threatEvents = threatEvents; return this; }

        public AnalysisSummaryResponse build() { return r; }
    }

    public static class ThreatEventDetail {
        private Long id;
        private String timestamp;
        private String clientIp;
        private String destinationUrl;
        private String domain;
        private String prediction;
        private Double confidence;
        private Integer riskScore;
        private String severity;
        private String mitreId;
        private String mitreName;
        private List<ContainmentDetail> containmentActions;

        public ThreatEventDetail() {
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getClientIp() { return clientIp; }
        public void setClientIp(String clientIp) { this.clientIp = clientIp; }
        public String getDestinationUrl() { return destinationUrl; }
        public void setDestinationUrl(String destinationUrl) { this.destinationUrl = destinationUrl; }
        public String getDomain() { return domain; }
        public void setDomain(String domain) { this.domain = domain; }
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getMitreId() { return mitreId; }
        public void setMitreId(String mitreId) { this.mitreId = mitreId; }
        public String getMitreName() { return mitreName; }
        public void setMitreName(String mitreName) { this.mitreName = mitreName; }
        public List<ContainmentDetail> getContainmentActions() { return containmentActions; }
        public void setContainmentActions(List<ContainmentDetail> containmentActions) { this.containmentActions = containmentActions; }

        public static ThreatEventDetailBuilder builder() {
            return new ThreatEventDetailBuilder();
        }

        public static class ThreatEventDetailBuilder {
            private ThreatEventDetail e = new ThreatEventDetail();

            public ThreatEventDetailBuilder id(Long id) { e.id = id; return this; }
            public ThreatEventDetailBuilder timestamp(String timestamp) { e.timestamp = timestamp; return this; }
            public ThreatEventDetailBuilder clientIp(String clientIp) { e.clientIp = clientIp; return this; }
            public ThreatEventDetailBuilder destinationUrl(String destinationUrl) { e.destinationUrl = destinationUrl; return this; }
            public ThreatEventDetailBuilder domain(String domain) { e.domain = domain; return this; }
            public ThreatEventDetailBuilder prediction(String prediction) { e.prediction = prediction; return this; }
            public ThreatEventDetailBuilder confidence(Double confidence) { e.confidence = confidence; return this; }
            public ThreatEventDetailBuilder riskScore(Integer riskScore) { e.riskScore = riskScore; return this; }
            public ThreatEventDetailBuilder severity(String severity) { e.severity = severity; return this; }
            public ThreatEventDetailBuilder mitreId(String mitreId) { e.mitreId = mitreId; return this; }
            public ThreatEventDetailBuilder mitreName(String mitreName) { e.mitreName = mitreName; return this; }
            public ThreatEventDetailBuilder containmentActions(List<ContainmentDetail> containmentActions) { e.containmentActions = containmentActions; return this; }

            public ThreatEventDetail build() { return e; }
        }
    }

    public static class ContainmentDetail {
        private String actionType;
        private String description;
        private String priority;

        public ContainmentDetail() {
        }

        public ContainmentDetail(String actionType, String description, String priority) {
            this.actionType = actionType;
            this.description = description;
            this.priority = priority;
        }

        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public static ContainmentDetailBuilder builder() {
            return new ContainmentDetailBuilder();
        }

        public static class ContainmentDetailBuilder {
            private ContainmentDetail c = new ContainmentDetail();

            public ContainmentDetailBuilder actionType(String actionType) { c.actionType = actionType; return this; }
            public ContainmentDetailBuilder description(String description) { c.description = description; return this; }
            public ContainmentDetailBuilder priority(String priority) { c.priority = priority; return this; }

            public ContainmentDetail build() { return c; }
        }
    }
}
