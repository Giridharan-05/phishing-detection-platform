package com.cyber.analysis.service;

import org.springframework.stereotype.Service;

@Service
public class RiskEngine {

    public int calculateRiskScore(String prediction, double confidence, double beaconScore, int domainReputation, int domainAgeDays) {
        if ("Benign".equalsIgnoreCase(prediction)) {
            return 5;
        }

        double baseScore = confidence * 0.5; // Up to 50 pts

        // Category weight
        int catWeight = switch (prediction.toUpperCase()) {
            case "MALWARE DISTRIBUTION" -> 25;
            case "COMMAND AND CONTROL" -> 25;
            case "DATA EXFILTRATION" -> 20;
            case "PHISHING" -> 15;
            default -> 10;
        };

        // Beaconing weight (up to 15 pts)
        double beaconWeight = (beaconScore / 100.0) * 15.0;

        // Reputation weight (up to 10 pts)
        double repWeight = (domainReputation / 100.0) * 10.0;

        // Newly registered domain penalty (up to 10 pts if age < 30 days)
        int agePenalty = 0;
        if (domainAgeDays < 7) {
            agePenalty = 10;
        } else if (domainAgeDays < 30) {
            agePenalty = 5;
        }

        int totalRisk = (int) Math.round(baseScore + catWeight + beaconWeight + repWeight + agePenalty);
        return Math.min(100, Math.max(10, totalRisk));
    }
}
