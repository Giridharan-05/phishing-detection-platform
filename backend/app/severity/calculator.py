from typing import Dict, Any, Tuple

class SeverityCalculator:
    BASE_SCORES = {
        "Command and Control": 95,
        "Malware Distribution": 90,
        "Data Exfiltration": 85,
        "Phishing": 75,
        "Benign": 0
    }

    def calculate_severity(self, category: str, confidence: float, features: Dict[str, Any]) -> Tuple[str, int]:
        """Calculates severity rating (Critical, High, Medium, Low, Info) and numeric score (0-100)."""
        if category == "Benign":
            return "Info", 0

        base = self.BASE_SCORES.get(category, 50)
        
        # Adjust base score based on confidence
        conf_modifier = (confidence - 80.0) * 0.2 if confidence > 80 else 0
        
        # Modifiers based on feature risk indicators
        feat_modifier = 0
        if features.get("has_executable", 0) == 1:
            feat_modifier += 8
        if features.get("shannon_entropy", 0.0) > 4.5:
            feat_modifier += 5
        if features.get("is_https", 1) == 0 and category in ["Phishing", "Data Exfiltration"]:
            feat_modifier += 4

        final_score = int(min(100, max(1, base + conf_modifier + feat_modifier)))

        if final_score >= 90:
            severity_label = "Critical"
        elif final_score >= 70:
            severity_label = "High"
        elif final_score >= 40:
            severity_label = "Medium"
        else:
            severity_label = "Low"

        return severity_label, final_score

severity_calculator = SeverityCalculator()
