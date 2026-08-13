package com.cyber.analysis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class PythonMlResponse {
    private String status;
    private String filename;
    @JsonProperty("total_urls")
    private Integer totalUrls;
    @JsonProperty("benign_count")
    private Integer benignCount;
    @JsonProperty("threat_count")
    private Integer threatCount;
    @JsonProperty("phishing_count")
    private Integer phishingCount;
    @JsonProperty("malware_count")
    private Integer malwareCount;
    @JsonProperty("c2_count")
    private Integer c2Count;
    @JsonProperty("exfiltration_count")
    private Integer exfiltrationCount;
    @JsonProperty("malicious_percentage")
    private Double maliciousPercentage;
    @JsonProperty("processing_time")
    private String processingTime;
    private List<EventDto> events;

    public PythonMlResponse() {
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public Integer getTotalUrls() { return totalUrls; }
    public void setTotalUrls(Integer totalUrls) { this.totalUrls = totalUrls; }
    public Integer getBenignCount() { return benignCount; }
    public void setBenignCount(Integer benignCount) { this.benignCount = benignCount; }
    public Integer getThreatCount() { return threatCount; }
    public void setThreatCount(Integer threatCount) { this.threatCount = threatCount; }
    public Integer getPhishingCount() { return phishingCount; }
    public void setPhishingCount(Integer phishingCount) { this.phishingCount = phishingCount; }
    public Integer getMalwareCount() { return malwareCount; }
    public void setMalwareCount(Integer malwareCount) { this.malwareCount = malwareCount; }
    public Integer getC2Count() { return c2Count; }
    public void setC2Count(Integer c2Count) { this.c2Count = c2Count; }
    public Integer getExfiltrationCount() { return exfiltrationCount; }
    public void setExfiltrationCount(Integer exfiltrationCount) { this.exfiltrationCount = exfiltrationCount; }
    public Double getMaliciousPercentage() { return maliciousPercentage; }
    public void setMaliciousPercentage(Double maliciousPercentage) { this.maliciousPercentage = maliciousPercentage; }
    public String getProcessingTime() { return processingTime; }
    public void setProcessingTime(String processingTime) { this.processingTime = processingTime; }
    public List<EventDto> getEvents() { return events; }
    public void setEvents(List<EventDto> events) { this.events = events; }

    public static class EventDto {
        private String timestamp;
        @JsonProperty("client_ip")
        private String clientIp;
        private String url;
        private String domain;
        private String method;
        @JsonProperty("status_code")
        private Integer statusCode;
        private Integer bytes;
        private String prediction;
        private Double confidence;
        @JsonProperty("beacon_score")
        private Double beaconScore;
        @JsonProperty("domain_reputation_score")
        private Integer domainReputationScore;
        @JsonProperty("domain_age_days")
        private Integer domainAgeDays;
        @JsonProperty("mitre_id")
        private String mitreId;
        @JsonProperty("mitre_name")
        private String mitreName;
        @JsonProperty("model_name")
        private String modelName;
        @JsonProperty("model_version")
        private String modelVersion;

        public EventDto() {
        }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getClientIp() { return clientIp; }
        public void setClientIp(String clientIp) { this.clientIp = clientIp; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getDomain() { return domain; }
        public void setDomain(String domain) { this.domain = domain; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public Integer getStatusCode() { return statusCode; }
        public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }
        public Integer getBytes() { return bytes; }
        public void setBytes(Integer bytes) { this.bytes = bytes; }
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        public Double getBeaconScore() { return beaconScore; }
        public void setBeaconScore(Double beaconScore) { this.beaconScore = beaconScore; }
        public Integer getDomainReputationScore() { return domainReputationScore; }
        public void setDomainReputationScore(Integer domainReputationScore) { this.domainReputationScore = domainReputationScore; }
        public Integer getDomainAgeDays() { return domainAgeDays; }
        public void setDomainAgeDays(Integer domainAgeDays) { this.domainAgeDays = domainAgeDays; }
        public String getMitreId() { return mitreId; }
        public void setMitreId(String mitreId) { this.mitreId = mitreId; }
        public String getMitreName() { return mitreName; }
        public void setMitreName(String mitreName) { this.mitreName = mitreName; }
        public String getModelName() { return modelName; }
        public void setModelName(String modelName) { this.modelName = modelName; }
        public String getModelVersion() { return modelVersion; }
        public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    }
}
