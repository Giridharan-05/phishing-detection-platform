package com.cyber.dashboard.dto;

public class DashboardSummaryDto {
    private Long totalFilesAnalyzed;
    private Long totalUrlsProcessed;
    private Long totalBenignUrls;
    private Long totalThreats;
    private Long totalPhishing;
    private Long totalMalware;
    private Long totalC2;
    private Long totalExfiltration;
    private Long totalCriticalAlerts;
    private Long totalHighAlerts;
    private Long totalMediumAlerts;
    private Long totalLowAlerts;
    private Double threatPercentage;
    private String activeSecurityStatus;

    public DashboardSummaryDto() {
    }

    public Long getTotalFilesAnalyzed() { return totalFilesAnalyzed; }
    public void setTotalFilesAnalyzed(Long totalFilesAnalyzed) { this.totalFilesAnalyzed = totalFilesAnalyzed; }
    public Long getTotalUrlsProcessed() { return totalUrlsProcessed; }
    public void setTotalUrlsProcessed(Long totalUrlsProcessed) { this.totalUrlsProcessed = totalUrlsProcessed; }
    public Long getTotalBenignUrls() { return totalBenignUrls; }
    public void setTotalBenignUrls(Long totalBenignUrls) { this.totalBenignUrls = totalBenignUrls; }
    public Long getTotalThreats() { return totalThreats; }
    public void setTotalThreats(Long totalThreats) { this.totalThreats = totalThreats; }
    public Long getTotalPhishing() { return totalPhishing; }
    public void setTotalPhishing(Long totalPhishing) { this.totalPhishing = totalPhishing; }
    public Long getTotalMalware() { return totalMalware; }
    public void setTotalMalware(Long totalMalware) { this.totalMalware = totalMalware; }
    public Long getTotalC2() { return totalC2; }
    public void setTotalC2(Long totalC2) { this.totalC2 = totalC2; }
    public Long getTotalExfiltration() { return totalExfiltration; }
    public void setTotalExfiltration(Long totalExfiltration) { this.totalExfiltration = totalExfiltration; }
    public Long getTotalCriticalAlerts() { return totalCriticalAlerts; }
    public void setTotalCriticalAlerts(Long totalCriticalAlerts) { this.totalCriticalAlerts = totalCriticalAlerts; }
    public Long getTotalHighAlerts() { return totalHighAlerts; }
    public void setTotalHighAlerts(Long totalHighAlerts) { this.totalHighAlerts = totalHighAlerts; }
    public Long getTotalMediumAlerts() { return totalMediumAlerts; }
    public void setTotalMediumAlerts(Long totalMediumAlerts) { this.totalMediumAlerts = totalMediumAlerts; }
    public Long getTotalLowAlerts() { return totalLowAlerts; }
    public void setTotalLowAlerts(Long totalLowAlerts) { this.totalLowAlerts = totalLowAlerts; }
    public Double getThreatPercentage() { return threatPercentage; }
    public void setThreatPercentage(Double threatPercentage) { this.threatPercentage = threatPercentage; }
    public String getActiveSecurityStatus() { return activeSecurityStatus; }
    public void setActiveSecurityStatus(String activeSecurityStatus) { this.activeSecurityStatus = activeSecurityStatus; }

    public static DashboardSummaryDtoBuilder builder() {
        return new DashboardSummaryDtoBuilder();
    }

    public static class DashboardSummaryDtoBuilder {
        private DashboardSummaryDto d = new DashboardSummaryDto();

        public DashboardSummaryDtoBuilder totalFilesAnalyzed(Long totalFilesAnalyzed) { d.totalFilesAnalyzed = totalFilesAnalyzed; return this; }
        public DashboardSummaryDtoBuilder totalUrlsProcessed(Long totalUrlsProcessed) { d.totalUrlsProcessed = totalUrlsProcessed; return this; }
        public DashboardSummaryDtoBuilder totalBenignUrls(Long totalBenignUrls) { d.totalBenignUrls = totalBenignUrls; return this; }
        public DashboardSummaryDtoBuilder totalThreats(Long totalThreats) { d.totalThreats = totalThreats; return this; }
        public DashboardSummaryDtoBuilder totalPhishing(Long totalPhishing) { d.totalPhishing = totalPhishing; return this; }
        public DashboardSummaryDtoBuilder totalMalware(Long totalMalware) { d.totalMalware = totalMalware; return this; }
        public DashboardSummaryDtoBuilder totalC2(Long totalC2) { d.totalC2 = totalC2; return this; }
        public DashboardSummaryDtoBuilder totalExfiltration(Long totalExfiltration) { d.totalExfiltration = totalExfiltration; return this; }
        public DashboardSummaryDtoBuilder totalCriticalAlerts(Long totalCriticalAlerts) { d.totalCriticalAlerts = totalCriticalAlerts; return this; }
        public DashboardSummaryDtoBuilder totalHighAlerts(Long totalHighAlerts) { d.totalHighAlerts = totalHighAlerts; return this; }
        public DashboardSummaryDtoBuilder totalMediumAlerts(Long totalMediumAlerts) { d.totalMediumAlerts = totalMediumAlerts; return this; }
        public DashboardSummaryDtoBuilder totalLowAlerts(Long totalLowAlerts) { d.totalLowAlerts = totalLowAlerts; return this; }
        public DashboardSummaryDtoBuilder threatPercentage(Double threatPercentage) { d.threatPercentage = threatPercentage; return this; }
        public DashboardSummaryDtoBuilder activeSecurityStatus(String activeSecurityStatus) { d.activeSecurityStatus = activeSecurityStatus; return this; }

        public DashboardSummaryDto build() { return d; }
    }
}
