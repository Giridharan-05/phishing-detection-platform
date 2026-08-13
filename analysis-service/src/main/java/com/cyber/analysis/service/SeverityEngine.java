package com.cyber.analysis.service;

import org.springframework.stereotype.Service;

@Service
public class SeverityEngine {

    public String determineSeverity(int riskScore, String prediction) {
        if ("Benign".equalsIgnoreCase(prediction)) {
            return "LOW";
        }

        if (riskScore >= 85) {
            return "CRITICAL";
        } else if (riskScore >= 65) {
            return "HIGH";
        } else if (riskScore >= 40) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
