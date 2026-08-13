package com.cyber.analysis.service;

import com.cyber.analysis.client.PythonMlClient;
import com.cyber.analysis.dto.AnalysisSummaryResponse;
import com.cyber.analysis.dto.AnalysisSummaryResponse.ContainmentDetail;
import com.cyber.analysis.dto.AnalysisSummaryResponse.ThreatEventDetail;
import com.cyber.analysis.dto.PythonMlRequest;
import com.cyber.analysis.dto.PythonMlResponse;
import com.cyber.analysis.dto.PythonMlResponse.EventDto;
import com.cyber.analysis.model.AnalysisBatch;
import com.cyber.analysis.model.ContainmentAction;
import com.cyber.analysis.model.ThreatEvent;
import com.cyber.analysis.repository.AnalysisBatchRepository;
import com.cyber.analysis.repository.ContainmentActionRepository;
import com.cyber.analysis.repository.ThreatEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalysisService {

    @Autowired
    private PythonMlClient pythonMlClient;

    @Autowired
    private AnalysisBatchRepository batchRepository;

    @Autowired
    private ThreatEventRepository threatEventRepository;

    @Autowired
    private ContainmentActionRepository containmentActionRepository;

    @Autowired
    private RiskEngine riskEngine;

    @Autowired
    private SeverityEngine severityEngine;

    @Autowired
    private ContainmentEngine containmentEngine;

    @Transactional
    public AnalysisSummaryResponse runAnalysis(String content, String filename, String username) {
        LocalDateTime startTime = LocalDateTime.now();

        // 1. Call Python Flask ML Service
        PythonMlResponse mlResponse;
        try {
            mlResponse = pythonMlClient.analyzeLogs(new PythonMlRequest(content, filename));
        } catch (feign.FeignException.BadRequest e) {
            throw new IllegalArgumentException("The uploaded file does not match SQUID or Bluecoat proxy log format. Please upload a valid proxy log file (e.g. sample_squid_logs.log).");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to communicate with Python ML Service: " + e.getMessage());
        }

        LocalDateTime endTime = LocalDateTime.now();

        // 2. Count Severities
        int lowCount = 0;
        int mediumCount = 0;
        int highCount = 0;
        int criticalCount = 0;

        List<EventDto> events = mlResponse.getEvents() != null ? mlResponse.getEvents() : new ArrayList<>();

        // Create AnalysisBatch entity
        AnalysisBatch batch = AnalysisBatch.builder()
                .filename(filename)
                .sourceFormat("SQUID / Bluecoat Proxy Log")
                .uploadTime(startTime)
                .analysisStartTime(startTime)
                .analysisEndTime(endTime)
                .processingDuration(mlResponse.getProcessingTime() != null ? mlResponse.getProcessingTime() : "0.5 sec")
                .status("COMPLETED")
                .totalEvents(mlResponse.getTotalUrls())
                .benignCount(mlResponse.getBenignCount())
                .maliciousCount(mlResponse.getThreatCount())
                .phishingCount(mlResponse.getPhishingCount())
                .c2Count(mlResponse.getC2Count())
                .malwareCount(mlResponse.getMalwareCount())
                .exfiltrationCount(mlResponse.getExfiltrationCount())
                .maliciousPercentage(mlResponse.getMaliciousPercentage())
                .modelName(events.isEmpty() ? "RandomForest" : events.get(0).getModelName())
                .modelVersion(events.isEmpty() ? "1.0" : events.get(0).getModelVersion())
                .createdBy(username != null ? username : "analyst")
                .build();

        batch = batchRepository.save(batch);
        Long batchId = batch.getId();

        List<ThreatEventDetail> threatDetails = new ArrayList<>();

        // Process individual threat events
        for (EventDto ev : events) {
            String pred = ev.getPrediction();
            double confidence = ev.getConfidence() != null ? ev.getConfidence() : 95.0;
            double beaconScore = ev.getBeaconScore() != null ? ev.getBeaconScore() : 0.0;
            int repScore = ev.getDomainReputationScore() != null ? ev.getDomainReputationScore() : 0;
            int ageDays = ev.getDomainAgeDays() != null ? ev.getDomainAgeDays() : 365;

            // Risk Engine
            int riskScore = riskEngine.calculateRiskScore(pred, confidence, beaconScore, repScore, ageDays);

            // Severity Engine
            String severity = severityEngine.determineSeverity(riskScore, pred);

            switch (severity.toUpperCase()) {
                case "CRITICAL" -> criticalCount++;
                case "HIGH" -> highCount++;
                case "MEDIUM" -> mediumCount++;
                default -> lowCount++;
            }

            // Save ThreatEvent
            ThreatEvent te = ThreatEvent.builder()
                    .batchId(batchId)
                    .timestamp(ev.getTimestamp())
                    .clientIp(ev.getClientIp())
                    .destinationUrl(ev.getUrl())
                    .domain(ev.getDomain())
                    .httpMethod(ev.getMethod())
                    .statusCode(ev.getStatusCode())
                    .prediction(pred)
                    .confidence(confidence)
                    .riskScore(riskScore)
                    .severity(severity)
                    .beaconScore(beaconScore)
                    .domainReputation(repScore)
                    .domainAgeDays(ageDays)
                    .mitreId(ev.getMitreId())
                    .mitreName(ev.getMitreName())
                    .build();

            te = threatEventRepository.save(te);

            // Generate Containment Recommendations
            List<ContainmentDetail> containmentDetails = containmentEngine.generateContainmentActions(pred, ev.getDomain(), ev.getClientIp());
            for (ContainmentDetail cd : containmentDetails) {
                ContainmentAction ca = ContainmentAction.builder()
                        .threatEventId(te.getId())
                        .batchId(batchId)
                        .actionType(cd.getActionType())
                        .description(cd.getDescription())
                        .priority(cd.getPriority())
                        .status("RECOMMENDED")
                        .build();
                containmentActionRepository.save(ca);
            }

            threatDetails.add(ThreatEventDetail.builder()
                    .id(te.getId())
                    .timestamp(ev.getTimestamp())
                    .clientIp(ev.getClientIp())
                    .destinationUrl(ev.getUrl())
                    .domain(ev.getDomain())
                    .prediction(pred)
                    .confidence(confidence)
                    .riskScore(riskScore)
                    .severity(severity)
                    .mitreId(ev.getMitreId())
                    .mitreName(ev.getMitreName())
                    .containmentActions(containmentDetails)
                    .build());
        }

        // Update batch severity counts
        batch.setLowCount(lowCount);
        batch.setMediumCount(mediumCount);
        batch.setHighCount(highCount);
        batch.setCriticalCount(criticalCount);
        batchRepository.save(batch);

        return AnalysisSummaryResponse.builder()
                .analysisId(batchId)
                .filename(filename)
                .status("COMPLETED")
                .totalEvents(batch.getTotalEvents())
                .benignCount(batch.getBenignCount())
                .maliciousCount(batch.getMaliciousCount())
                .phishingCount(batch.getPhishingCount())
                .c2Count(batch.getC2Count())
                .malwareCount(batch.getMalwareCount())
                .exfiltrationCount(batch.getExfiltrationCount())
                .criticalCount(criticalCount)
                .highCount(highCount)
                .mediumCount(mediumCount)
                .lowCount(lowCount)
                .maliciousPercentage(batch.getMaliciousPercentage())
                .processingDuration(batch.getProcessingDuration())
                .modelName(batch.getModelName())
                .modelVersion(batch.getModelVersion())
                .threatEvents(threatDetails)
                .build();
    }

    public AnalysisSummaryResponse getAnalysisById(Long analysisId) {
        AnalysisBatch batch = batchRepository.findById(analysisId).orElse(null);
        if (batch == null) return null;

        List<ThreatEvent> events = threatEventRepository.findByBatchId(analysisId);
        List<ThreatEventDetail> threatDetails = new ArrayList<>();

        for (ThreatEvent te : events) {
            List<ContainmentAction> actions = containmentActionRepository.findByThreatEventId(te.getId());
            List<ContainmentDetail> cdList = actions.stream()
                    .map(a -> new ContainmentDetail(a.getActionType(), a.getDescription(), a.getPriority()))
                    .toList();

            threatDetails.add(ThreatEventDetail.builder()
                    .id(te.getId())
                    .timestamp(te.getTimestamp())
                    .clientIp(te.getClientIp())
                    .destinationUrl(te.getDestinationUrl())
                    .domain(te.getDomain())
                    .prediction(te.getPrediction())
                    .confidence(te.getConfidence())
                    .riskScore(te.getRiskScore())
                    .severity(te.getSeverity())
                    .mitreId(te.getMitreId())
                    .mitreName(te.getMitreName())
                    .containmentActions(cdList)
                    .build());
        }

        return AnalysisSummaryResponse.builder()
                .analysisId(batch.getId())
                .filename(batch.getFilename())
                .status(batch.getStatus())
                .totalEvents(batch.getTotalEvents())
                .benignCount(batch.getBenignCount())
                .maliciousCount(batch.getMaliciousCount())
                .phishingCount(batch.getPhishingCount())
                .c2Count(batch.getC2Count())
                .malwareCount(batch.getMalwareCount())
                .exfiltrationCount(batch.getExfiltrationCount())
                .criticalCount(batch.getCriticalCount())
                .highCount(batch.getHighCount())
                .mediumCount(batch.getMediumCount())
                .lowCount(batch.getLowCount())
                .maliciousPercentage(batch.getMaliciousPercentage())
                .processingDuration(batch.getProcessingDuration())
                .modelName(batch.getModelName())
                .modelVersion(batch.getModelVersion())
                .threatEvents(threatDetails)
                .build();
    }

    public List<AnalysisSummaryResponse> getAnalysisHistory() {
        List<AnalysisBatch> batches = batchRepository.findAllByOrderByCreatedAtDesc();
        return batches.stream().map(b -> getAnalysisById(b.getId())).toList();
    }

    public List<ThreatEvent> getAllThreatEvents(String search, String category, String severity, String status) {
        List<ThreatEvent> all = threatEventRepository.findAll();
        return all.stream().filter(t -> {
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = (t.getDomain() != null && t.getDomain().toLowerCase().contains(q))
                        || (t.getDestinationUrl() != null && t.getDestinationUrl().toLowerCase().contains(q))
                        || (t.getClientIp() != null && t.getClientIp().toLowerCase().contains(q))
                        || (t.getPrediction() != null && t.getPrediction().toLowerCase().contains(q));
                if (!match) return false;
            }
            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                if (!category.equalsIgnoreCase(t.getPrediction())) return false;
            }
            if (severity != null && !severity.isBlank() && !"ALL".equalsIgnoreCase(severity)) {
                if (!severity.equalsIgnoreCase(t.getSeverity())) return false;
            }
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(t.getContainmentStatus())) return false;
            }
            return true;
        }).toList();
    }

    public ThreatEvent getThreatById(Long id) {
        return threatEventRepository.findById(id).orElse(null);
    }

    @Transactional
    public ThreatEvent mitigateThreat(Long threatId, String actionType, String username) {
        ThreatEvent te = threatEventRepository.findById(threatId).orElse(null);
        if (te == null) return null;

        te.setContainmentStatus("Contained");
        te = threatEventRepository.save(te);

        ContainmentAction ca = ContainmentAction.builder()
                .threatEventId(te.getId())
                .batchId(te.getBatchId())
                .actionType(actionType != null ? actionType : "Automated Block")
                .description("Action '" + actionType + "' executed by " + (username != null ? username : "analyst") + " on " + te.getDomain())
                .priority("HIGH")
                .status("EXECUTED")
                .build();
        containmentActionRepository.save(ca);

        return te;
    }

    public List<ThreatEvent> getRecentFeed() {
        return threatEventRepository.findTop10ByOrderByIdDesc();
    }

    public List<ThreatEvent> searchIoc(String query) {
        if (query == null || query.isBlank()) return new ArrayList<>();
        return threatEventRepository.findByDomainContainingIgnoreCaseOrDestinationUrlContainingIgnoreCaseOrClientIpContainingIgnoreCase(query, query, query);
    }
}

