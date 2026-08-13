from typing import Dict, Any

class DomainAgeService:
    """
    Domain Age Service Abstraction.
    Prototype mode returns local dataset / mock values clearly labeled.
    Future mode connects to WHOIS / RDAP domain intelligence APIs.
    """
    KNOWN_AGE_MAP = {
        "google.com": 9500,
        "github.com": 6000,
        "microsoft.com": 10000,
        "evil-phish.xyz": 3,
        "malware-drop.top": 1,
        "c2-beacon.ru": 5,
        "data-exfil.tk": 2
    }

    def get_domain_age(self, domain: str) -> Dict[str, Any]:
        domain_lower = domain.lower()
        if domain_lower in self.KNOWN_AGE_MAP:
            return {
                "domain_age_days": self.KNOWN_AGE_MAP[domain_lower],
                "source": "Local Domain Intelligence Database",
                "is_mock": False
            }

        # Suspicious newly registered domain simulation
        if any(domain_lower.endswith(tld) for tld in [".xyz", ".top", ".ru", ".tk"]):
            return {
                "domain_age_days": 14,
                "source": "WHOIS Heuristic Estimate (Demo)",
                "is_mock": True
            }

        return {
            "domain_age_days": 1250,
            "source": "WHOIS Baseline Estimate (Demo)",
            "is_mock": True
        }

domain_age_service = DomainAgeService()
