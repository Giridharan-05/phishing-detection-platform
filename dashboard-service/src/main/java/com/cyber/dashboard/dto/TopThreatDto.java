package com.cyber.dashboard.dto;

public class TopThreatDto {
    private String clientIp;
    private String destinationUrl;
    private String prediction;
    private Double confidence;
    private String severity;
    private String mitreId;

    public TopThreatDto() {
    }

    public TopThreatDto(String clientIp, String destinationUrl, String prediction, Double confidence, String severity, String mitreId) {
        this.clientIp = clientIp;
        this.destinationUrl = destinationUrl;
        this.prediction = prediction;
        this.confidence = confidence;
        this.severity = severity;
        this.mitreId = mitreId;
    }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }
    public String getDestinationUrl() { return destinationUrl; }
    public void setDestinationUrl(String destinationUrl) { this.destinationUrl = destinationUrl; }
    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getMitreId() { return mitreId; }
    public void setMitreId(String mitreId) { this.mitreId = mitreId; }
}
