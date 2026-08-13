package com.cyber.analysis.controller;

import com.cyber.analysis.dto.AnalysisSummaryResponse;
import com.cyber.analysis.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/analysis")
@Tag(name = "Analysis API", description = "Endpoints for proxy log upload, ML threat classification, risk scoring, MITRE ATT&CK attribution, and history retrieval")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @Operation(
        summary = "Upload and Run Log Analysis",
        description = "Uploads a SQUID or Bluecoat proxy log file (multipart/form-data) or passes raw log text to execute ML analysis, risk engine, MITRE mapping, and containment action generation.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAndRunLogAnalysis(
            @Parameter(description = "SQUID or Bluecoat proxy log file", required = true)
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Subject", required = false) String username
    ) {
        return processLogFile(file, null, username);
    }

    @Operation(
        summary = "Run Log Analysis (Multipart or Raw Payload)",
        description = "Executes log analysis on uploaded file or raw text body",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping(value = "/run", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE})
    public ResponseEntity<?> runLogAnalysis(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody(required = false) String rawBody,
            @RequestHeader(value = "X-User-Subject", required = false) String username
    ) {
        return processLogFile(file, rawBody, username);
    }

    private ResponseEntity<?> processLogFile(MultipartFile file, String rawBody, String username) {
        try {
            String content = "";
            String filename = "uploaded_proxy.log";

            if (file != null && !file.isEmpty()) {
                filename = file.getOriginalFilename();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                    content = reader.lines().collect(Collectors.joining("\n"));
                }
            } else if (rawBody != null && !rawBody.isBlank()) {
                content = rawBody;
            } else {
                return ResponseEntity.badRequest().body("Error: File payload or raw log text content is required!");
            }

            AnalysisSummaryResponse response = analysisService.runAnalysis(content, filename, username);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Analysis Service Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Get Analysis History",
        description = "Retrieves all historical proxy log analysis summaries from MySQL",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/history")
    public ResponseEntity<List<AnalysisSummaryResponse>> getHistory() {
        return ResponseEntity.ok(analysisService.getAnalysisHistory());
    }

    @Operation(
        summary = "Get Analysis Summary by ID",
        description = "Retrieves stored analysis batch summary details and threat metrics by batch ID",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{analysisId}")
    public ResponseEntity<?> getAnalysisById(
            @Parameter(description = "ID of the analysis batch", required = true)
            @PathVariable("analysisId") Long analysisId
    ) {
        AnalysisSummaryResponse summary = analysisService.getAnalysisById(analysisId);
        if (summary == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: Analysis record with ID " + analysisId + " not found!");
        }
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Get Filtered Threat Events", description = "Retrieves stored threat events with optional search, category, severity, and status filters", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/threats")
    public ResponseEntity<?> getThreatEvents(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "severity", required = false) String severity,
            @RequestParam(value = "status", required = false) String status
    ) {
        return ResponseEntity.ok(analysisService.getAllThreatEvents(search, category, severity, status));
    }

    @Operation(summary = "Get Threat Event Details by ID", description = "Retrieves detailed threat event info by threat ID", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/threats/{threatId}")
    public ResponseEntity<?> getThreatById(@PathVariable("threatId") Long threatId) {
        var te = analysisService.getThreatById(threatId);
        if (te == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Threat event " + threatId + " not found");
        }
        return ResponseEntity.ok(te);
    }

    @Operation(summary = "Mitigate Threat Event", description = "Executes containment action on a specific threat event and updates MySQL status", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/threats/{threatId}/mitigate")
    public ResponseEntity<?> mitigateThreat(
            @PathVariable("threatId") Long threatId,
            @RequestParam(value = "action", required = false, defaultValue = "Block URL") String action,
            @RequestHeader(value = "X-User-Subject", required = false) String username
    ) {
        var te = analysisService.mitigateThreat(threatId, action, username);
        if (te == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Threat event " + threatId + " not found");
        }
        return ResponseEntity.ok(te);
    }

    @Operation(summary = "Get Recent Threat Notification Feed", description = "Retrieves top 10 recent threat events for notification center", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/recent-feed")
    public ResponseEntity<?> getRecentFeed() {
        return ResponseEntity.ok(analysisService.getRecentFeed());
    }

    @Operation(summary = "Search IOC Intelligence", description = "Searches stored proxy threat events by IP, Domain, or URL query", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/ioc/search")
    public ResponseEntity<?> searchIoc(@RequestParam("query") String query) {
        return ResponseEntity.ok(analysisService.searchIoc(query));
    }
}

