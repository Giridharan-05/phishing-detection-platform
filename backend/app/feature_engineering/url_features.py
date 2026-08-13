import math
import re
from urllib.parse import urlparse
from typing import Dict, Any

class URLFeatureExtractor:
    EXECUTABLE_EXTENSIONS = ('.exe', '.scr', '.zip', '.dll', '.bat', '.vbs', '.bin', '.ps1', '.sh', '.apk', '.iso', '.img', '.elf', '.msi')

    def calculate_entropy(self, s: str) -> float:
        """Calculates Shannon Entropy of a string to measure randomness/obfuscation."""
        if not s:
            return 0.0
        prob = [float(s.count(c)) / len(s) for c in set(s)]
        return -sum(p * math.log2(p) for p in prob)

    def extract_features(self, url: str) -> Dict[str, Any]:
        """Extracts comprehensive cybersecurity features from a URL."""
        parsed = urlparse(url)
        netloc = parsed.netloc or parsed.path.split('/')[0]
        domain = netloc.split(':')[0] # strip port if present

        url_length = len(url)
        domain_length = len(domain)
        num_dots = url.count('.')
        num_digits = sum(c.isdigit() for c in url)
        
        is_https = 1 if parsed.scheme.lower() == 'https' else 0
        url_lower = url.lower()
        
        has_login = 1 if 'login' in url_lower or 'signin' in url_lower else 0
        has_verify = 1 if 'verify' in url_lower or 'account' in url_lower or 'confirm' in url_lower else 0
        has_secure = 1 if 'secure' in url_lower or 'auth' in url_lower or 'update' in url_lower else 0
        
        has_executable = 1 if any(url_lower.endswith(ext) or ext in url_lower for ext in self.EXECUTABLE_EXTENSIONS) else 0
        
        domain_parts = domain.split('.')
        subdomain_count = max(0, len(domain_parts) - 2)
        
        entropy = self.calculate_entropy(url)

        return {
            "url": url,
            "domain": domain,
            "url_length": url_length,
            "domain_length": domain_length,
            "num_dots": num_dots,
            "num_digits": num_digits,
            "is_https": is_https,
            "has_login": has_login,
            "has_verify": has_verify,
            "has_secure": has_secure,
            "has_executable": has_executable,
            "subdomain_count": subdomain_count,
            "shannon_entropy": round(entropy, 4)
        }

url_feature_extractor = URLFeatureExtractor()
