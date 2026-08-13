package com.cyber.dashboard.dto;

public class TopDomainDto {
    private String domain;
    private Long hitCount;
    private String category;
    private String highestSeverity;

    public TopDomainDto() {
    }

    public TopDomainDto(String domain, Long hitCount, String category, String highestSeverity) {
        this.domain = domain;
        this.hitCount = hitCount;
        this.category = category;
        this.highestSeverity = highestSeverity;
    }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public Long getHitCount() { return hitCount; }
    public void setHitCount(Long hitCount) { this.hitCount = hitCount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getHighestSeverity() { return highestSeverity; }
    public void setHighestSeverity(String highestSeverity) { this.highestSeverity = highestSeverity; }
}
