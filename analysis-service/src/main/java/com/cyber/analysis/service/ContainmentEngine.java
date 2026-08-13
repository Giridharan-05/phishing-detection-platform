package com.cyber.analysis.service;

import com.cyber.analysis.dto.AnalysisSummaryResponse.ContainmentDetail;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ContainmentEngine {

    public List<ContainmentDetail> generateContainmentActions(String prediction, String domain, String clientIp) {
        List<ContainmentDetail> actions = new ArrayList<>();

        switch (prediction.toUpperCase()) {
            case "PHISHING":
                actions.add(new ContainmentDetail("BLOCK_DOMAIN", "Add domain '" + domain + "' to web proxy blocklist immediately.", "HIGH"));
                actions.add(new ContainmentDetail("RESET_CREDENTIALS", "Force password reset for affected host " + clientIp + " users.", "HIGH"));
                actions.add(new ContainmentDetail("NOTIFY_USER", "Dispatch security awareness email to user on host " + clientIp + ".", "MEDIUM"));
                break;

            case "MALWARE DISTRIBUTION":
                actions.add(new ContainmentDetail("BLOCK_URL", "Block download URL and domain '" + domain + "' across network firewall.", "CRITICAL"));
                actions.add(new ContainmentDetail("ISOLATE_HOST", "Isolate endpoint " + clientIp + " from local VLAN network segment.", "HIGH"));
                actions.add(new ContainmentDetail("EDR_SCAN", "Trigger full antivirus & EDR scan on host " + clientIp + ".", "HIGH"));
                break;

            case "COMMAND AND CONTROL":
                actions.add(new ContainmentDetail("BLOCK_C2_DESTINATION", "Drop outbound TCP/UDP traffic to C2 domain '" + domain + "'.", "CRITICAL"));
                actions.add(new ContainmentDetail("ISOLATE_HOST", "Immediately isolate endpoint " + clientIp + " from corporate network.", "CRITICAL"));
                actions.add(new ContainmentDetail("INVESTIGATE_PERSISTENCE", "Inspect active processes and autorun keys on host " + clientIp + ".", "HIGH"));
                break;

            case "DATA EXFILTRATION":
                actions.add(new ContainmentDetail("BLOCK_EXFIL_ENDPOINT", "Terminate outbound connections to " + domain + ".", "CRITICAL"));
                actions.add(new ContainmentDetail("AUDIT_DATA_TRANSFER", "Analyze network flow logs for sensitive data volume exfiltrated by " + clientIp + ".", "HIGH"));
                actions.add(new ContainmentDetail("ESCALATE_INCIDENT", "Create Tier-3 SOC Incident Ticket for data loss investigation.", "HIGH"));
                break;

            default:
                actions.add(new ContainmentDetail("NO_ACTION", "Traffic identified as benign. No containment required.", "LOW"));
                break;
        }

        return actions;
    }
}
