from typing import Dict, Any

class MITREMapper:
    MAPPINGS = {
        "Phishing": {
            "technique_id": "T1566",
            "technique_name": "Phishing",
            "tactic": "Initial Access",
            "description": "Adversaries may send phishing messages with malicious links to gain access to victim systems or credential harvest."
        },
        "Malware Distribution": {
            "technique_id": "T1105",
            "technique_name": "Ingress Tool Transfer",
            "tactic": "Execution / Command and Control",
            "description": "Adversaries may transfer tools or malicious files from an external system into a compromised environment."
        },
        "Command and Control": {
            "technique_id": "T1071",
            "technique_name": "Application Layer Protocol",
            "tactic": "Command and Control",
            "description": "Adversaries may communicate using application layer protocols (HTTP/HTTPS) to avoid detection and maintain persistence."
        },
        "Data Exfiltration": {
            "technique_id": "T1041",
            "technique_name": "Exfiltration Over C2 Channel",
            "tactic": "Exfiltration",
            "description": "Adversaries may steal data by transferring it over an existing command and control channel or covert web endpoint."
        },
        "Benign": {
            "technique_id": "N/A",
            "technique_name": "Benign Traffic",
            "tactic": "None",
            "description": "Normal, non-malicious web traffic activity verified against baseline rules."
        }
    }

    def get_mitre_mapping(self, category: str) -> Dict[str, Any]:
        """Returns the MITRE ATT&CK technique details for a given threat category."""
        return self.MAPPINGS.get(category, {
            "technique_id": "T1204",
            "technique_name": "User Execution",
            "tactic": "Execution",
            "description": "General suspicious link or executable interaction detected."
        })

mitre_mapper = MITREMapper()
