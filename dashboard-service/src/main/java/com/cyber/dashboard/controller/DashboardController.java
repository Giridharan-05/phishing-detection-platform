package com.cyber.dashboard.controller;

import com.cyber.dashboard.dto.DashboardSummaryDto;
import com.cyber.dashboard.dto.TopDomainDto;
import com.cyber.dashboard.dto.TopThreatDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard API", description = "Endpoints for SOC executive summary statistics, threat distribution analytics, top malicious domains, and top targeted IPs")
public class DashboardController {

    @PersistenceContext
    private EntityManager entityManager;

    @Operation(
        summary = "Get Dashboard Summary Statistics",
        description = "Retrieves executive SOC summary metrics including total files analyzed, total URLs processed, threat counts by category, severity distribution, and active security status",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        try {
            Long totalFiles = ((Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM analysis_batch").getSingleResult()).longValue();

            Long totalUrls = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(total_events), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long benignUrls = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(benign_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long totalThreats = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(malicious_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long phishing = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(phishing_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long malware = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(malware_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long c2 = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(c2_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long exfil = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(exfiltration_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long critical = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(critical_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long high = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(high_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long medium = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(medium_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            Long low = ((Number) entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(low_count), 0) FROM analysis_batch").getSingleResult()).longValue();

            double threatPct = totalUrls > 0 ? Math.round((totalThreats.doubleValue() / totalUrls.doubleValue() * 100.0) * 10.0) / 10.0 : 0.0;
            String status = critical > 0 ? "ELEVATED THREAT LEVEL" : (totalThreats > 0 ? "ATTENTION REQUIRED" : "ALL SYSTEMS NOMINAL");

            return ResponseEntity.ok(DashboardSummaryDto.builder()
                    .totalFilesAnalyzed(totalFiles)
                    .totalUrlsProcessed(totalUrls)
                    .totalBenignUrls(benignUrls)
                    .totalThreats(totalThreats)
                    .totalPhishing(phishing)
                    .totalMalware(malware)
                    .totalC2(c2)
                    .totalExfiltration(exfil)
                    .totalCriticalAlerts(critical)
                    .totalHighAlerts(high)
                    .totalMediumAlerts(medium)
                    .totalLowAlerts(low)
                    .threatPercentage(threatPct)
                    .activeSecurityStatus(status)
                    .build());
        } catch (Exception e) {
            // Fallback for fresh uninitialized DB
            return ResponseEntity.ok(DashboardSummaryDto.builder()
                    .totalFilesAnalyzed(0L)
                    .totalUrlsProcessed(0L)
                    .totalBenignUrls(0L)
                    .totalThreats(0L)
                    .totalPhishing(0L)
                    .totalMalware(0L)
                    .totalC2(0L)
                    .totalExfiltration(0L)
                    .totalCriticalAlerts(0L)
                    .totalHighAlerts(0L)
                    .totalMediumAlerts(0L)
                    .totalLowAlerts(0L)
                    .threatPercentage(0.0)
                    .activeSecurityStatus("NO LOGS ANALYZED")
                    .build());
        }
    }

    @Operation(
        summary = "Get Dashboard Analytics Distribution",
        description = "Alias endpoint for retrieving threat summary statistics and analytics data",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/analytics")
    public ResponseEntity<DashboardSummaryDto> getAnalytics() {
        return getSummary();
    }

    @Operation(
        summary = "Get Top Malicious Domains",
        description = "Retrieves top malicious domains grouped by hit count and severity",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/top-domains")
    public ResponseEntity<List<TopDomainDto>> getTopDomains() {
        List<TopDomainDto> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT domain, COUNT(*) as hits, prediction, severity FROM threat_event WHERE prediction != 'Benign' GROUP BY domain, prediction, severity ORDER BY hits DESC LIMIT 10"
            ).getResultList();

            for (Object[] r : rows) {
                result.add(new TopDomainDto(
                        (String) r[0],
                        ((Number) r[1]).longValue(),
                        (String) r[2],
                        (String) r[3]
                ));
            }
        } catch (Exception ignored) {}
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Get Top Threat Events",
        description = "Retrieves top 10 highest risk threat events across all analyzed batches",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/top-threats")
    public ResponseEntity<List<TopThreatDto>> getTopThreats() {
        List<TopThreatDto> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT client_ip, destination_url, prediction, confidence, severity, mitre_id FROM threat_event WHERE prediction != 'Benign' ORDER BY risk_score DESC LIMIT 10"
            ).getResultList();

            for (Object[] r : rows) {
                result.add(new TopThreatDto(
                        (String) r[0],
                        (String) r[1],
                        (String) r[2],
                        ((Number) r[3]).doubleValue(),
                        (String) r[4],
                        (String) r[5]
                ));
            }
        } catch (Exception ignored) {}
        return ResponseEntity.ok(result);
    }
}
