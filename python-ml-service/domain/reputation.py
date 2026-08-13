from typing import Dict, Any

class DomainReputationService:
    """
    Domain Reputation Intelligence Abstraction.
    Supports Prototype mode (Local Threat DB / CSV) and Future API Integrations (VirusTotal, AlienVault OTX).
    """
    LOCAL_THREAT_DOMAINS = {
        "evil-phish.xyz": {"score": 95, "source": "Local Threat Feed", "known_malicious": True},
        "malware-drop.top": {"score": 98, "source": "Local Threat Feed", "known_malicious": True},
        "c2-beacon.ru": {"score": 92, "source": "Local Threat Feed", "known_malicious": True},
        "data-exfil.tk": {"score": 90, "source": "Local Threat Feed", "known_malicious": True},
        "google.com": {"score": 0, "source": "Local Allowlist", "known_malicious": False},
        "github.com": {"score": 0, "source": "Local Allowlist", "known_malicious": False}
    }

    def get_reputation(self, domain: str) -> Dict[str, Any]:
        domain_lower = domain.lower()
        if domain_lower in self.LOCAL_THREAT_DOMAINS:
            return self.LOCAL_THREAT_DOMAINS[domain_lower]

        # Check for suspicious TLDs in prototype mode
        if any(domain_lower.endswith(tld) for tld in [".xyz", ".top", ".ru", ".tk", ".cf", ".gq"]):
            return {
                "score": 65,
                "source": "Local Heuristic Reputation Feed (Demo)",
                "known_malicious": False
            }

        return {
            "score": 5,
            "source": "Local Neutral Baseline (Demo)",
            "known_malicious": False
        }

domain_reputation_service = DomainReputationService()
