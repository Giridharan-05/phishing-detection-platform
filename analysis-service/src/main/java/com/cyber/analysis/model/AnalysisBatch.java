package com.cyber.analysis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_batch", indexes = {
        @Index(name = "idx_batch_created_at", columnList = "created_at")
})
public class AnalysisBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "source_format")
    private String sourceFormat;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime;

    @Column(name = "analysis_start_time")
    private LocalDateTime analysisStartTime;

    @Column(name = "analysis_end_time")
    private LocalDateTime analysisEndTime;

    @Column(name = "processing_duration")
    private String processingDuration;

    @Column(name = "status")
    private String status;

    @Column(name = "total_events")
    private Integer totalEvents;

    @Column(name = "benign_count")
    private Integer benignCount;

    @Column(name = "malicious_count")
    private Integer maliciousCount;

    @Column(name = "phishing_count")
    private Integer phishingCount;

    @Column(name = "c2_count")
    private Integer c2Count;

    @Column(name = "malware_count")
    private Integer malwareCount;

    @Column(name = "exfiltration_count")
    private Integer exfiltrationCount;

    @Column(name = "low_count")
    private Integer lowCount;

    @Column(name = "medium_count")
    private Integer mediumCount;

    @Column(name = "high_count")
    private Integer highCount;

    @Column(name = "critical_count")
    private Integer criticalCount;

    @Column(name = "malicious_percentage")
    private Double maliciousPercentage;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public AnalysisBatch() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getSourceFormat() { return sourceFormat; }
    public void setSourceFormat(String sourceFormat) { this.sourceFormat = sourceFormat; }
    public LocalDateTime getUploadTime() { return uploadTime; }
    public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }
    public LocalDateTime getAnalysisStartTime() { return analysisStartTime; }
    public void setAnalysisStartTime(LocalDateTime analysisStartTime) { this.analysisStartTime = analysisStartTime; }
    public LocalDateTime getAnalysisEndTime() { return analysisEndTime; }
    public void setAnalysisEndTime(LocalDateTime analysisEndTime) { this.analysisEndTime = analysisEndTime; }
    public String getProcessingDuration() { return processingDuration; }
    public void setProcessingDuration(String processingDuration) { this.processingDuration = processingDuration; }
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
    public Integer getLowCount() { return lowCount; }
    public void setLowCount(Integer lowCount) { this.lowCount = lowCount; }
    public Integer getMediumCount() { return mediumCount; }
    public void setMediumCount(Integer mediumCount) { this.mediumCount = mediumCount; }
    public Integer getHighCount() { return highCount; }
    public void setHighCount(Integer highCount) { this.highCount = highCount; }
    public Integer getCriticalCount() { return criticalCount; }
    public void setCriticalCount(Integer criticalCount) { this.criticalCount = criticalCount; }
    public Double getMaliciousPercentage() { return maliciousPercentage; }
    public void setMaliciousPercentage(Double maliciousPercentage) { this.maliciousPercentage = maliciousPercentage; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AnalysisBatchBuilder builder() {
        return new AnalysisBatchBuilder();
    }

    public static class AnalysisBatchBuilder {
        private AnalysisBatch b = new AnalysisBatch();

        public AnalysisBatchBuilder id(Long id) { b.id = id; return this; }
        public AnalysisBatchBuilder filename(String filename) { b.filename = filename; return this; }
        public AnalysisBatchBuilder sourceFormat(String sourceFormat) { b.sourceFormat = sourceFormat; return this; }
        public AnalysisBatchBuilder uploadTime(LocalDateTime uploadTime) { b.uploadTime = uploadTime; return this; }
        public AnalysisBatchBuilder analysisStartTime(LocalDateTime analysisStartTime) { b.analysisStartTime = analysisStartTime; return this; }
        public AnalysisBatchBuilder analysisEndTime(LocalDateTime analysisEndTime) { b.analysisEndTime = analysisEndTime; return this; }
        public AnalysisBatchBuilder processingDuration(String processingDuration) { b.processingDuration = processingDuration; return this; }
        public AnalysisBatchBuilder status(String status) { b.status = status; return this; }
        public AnalysisBatchBuilder totalEvents(Integer totalEvents) { b.totalEvents = totalEvents; return this; }
        public AnalysisBatchBuilder benignCount(Integer benignCount) { b.benignCount = benignCount; return this; }
        public AnalysisBatchBuilder maliciousCount(Integer maliciousCount) { b.maliciousCount = maliciousCount; return this; }
        public AnalysisBatchBuilder phishingCount(Integer phishingCount) { b.phishingCount = phishingCount; return this; }
        public AnalysisBatchBuilder c2Count(Integer c2Count) { b.c2Count = c2Count; return this; }
        public AnalysisBatchBuilder malwareCount(Integer malwareCount) { b.malwareCount = malwareCount; return this; }
        public AnalysisBatchBuilder exfiltrationCount(Integer exfiltrationCount) { b.exfiltrationCount = exfiltrationCount; return this; }
        public AnalysisBatchBuilder lowCount(Integer lowCount) { b.lowCount = lowCount; return this; }
        public AnalysisBatchBuilder mediumCount(Integer mediumCount) { b.mediumCount = mediumCount; return this; }
        public AnalysisBatchBuilder highCount(Integer highCount) { b.highCount = highCount; return this; }
        public AnalysisBatchBuilder criticalCount(Integer criticalCount) { b.criticalCount = criticalCount; return this; }
        public AnalysisBatchBuilder maliciousPercentage(Double maliciousPercentage) { b.maliciousPercentage = maliciousPercentage; return this; }
        public AnalysisBatchBuilder modelName(String modelName) { b.modelName = modelName; return this; }
        public AnalysisBatchBuilder modelVersion(String modelVersion) { b.modelVersion = modelVersion; return this; }
        public AnalysisBatchBuilder createdBy(String createdBy) { b.createdBy = createdBy; return this; }
        public AnalysisBatchBuilder createdAt(LocalDateTime createdAt) { b.createdAt = createdAt; return this; }

        public AnalysisBatch build() { return b; }
    }
}
