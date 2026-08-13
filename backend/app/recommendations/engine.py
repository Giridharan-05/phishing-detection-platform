from typing import Dict, Any

class RecommendationEngine:
    RECOMMENDATIONS = {
        "Malware Distribution": "Block URL immediately on Web Proxy/WAF, Isolate Host IP from corporate VLAN, and execute Endpoint Detection & Response (EDR) full malware scan.",
        "Phishing": "Blacklist destination domain on Perimeter Firewalls, trigger forced password reset for impacted user, and flush DNS resolver caches.",
        "Command and Control": "Terminate active TCP/UDP session immediately, block C2 IP address at perimeter gateway, and quarantine host for forensic analysis.",
        "Data Exfiltration": "Revoke active OAuth/session tokens, block egress data traffic to target IP, and inspect proxy DLP payload logs.",
        "Benign": "No mitigation action required. Traffic matches standard baseline patterns."
    }

    def generate_recommendation(self, category: str, severity: str, domain: str = "") -> str:
        """Generates clear, SOC-ready mitigation playbook recommendations."""
        rec = self.RECOMMENDATIONS.get(category, "Log event for security monitoring and review threat intelligence feeds.")
        if severity == "Critical" and category != "Benign":
            rec += f" [URGENT: Escalated to Level-3 SOC Tier due to Critical severity rating]."
        return rec

recommendation_engine = RecommendationEngine()
