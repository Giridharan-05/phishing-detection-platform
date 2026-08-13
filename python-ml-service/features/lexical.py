import re
from urllib.parse import urlparse
from typing import Dict, Any

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "signin",
    "bank", "password", "confirm", "download", "payload", "setup",
    "patch", "crack", "key-gen", "dropper", "beacon", "gate",
    "bot", "c2", "cmd", "shell", "callback", "exfil", "dump"
]

def extract_lexical_features(url: str) -> Dict[str, Any]:
    url_lower = url.lower()
    parsed = urlparse(url if "://" in url else f"http://{url}")

    host = parsed.netloc or parsed.path.split("/")[0]
    domain = host.split(":")[0]
    path = parsed.path or ""

    # Subdomain count
    domain_parts = domain.split(".")
    subdomain_count = max(0, len(domain_parts) - 2) if not re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) else 0

    # Path depth
    path_depth = len([p for p in path.split("/") if p])

    # IP address as host flag
    is_ip_host = 1 if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) else 0

    # Counts
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_underscores = url.count("_")
    num_digits = sum(c.isdigit() for c in url)
    num_special = len(re.findall(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", url))
    query_param_count = len(parsed.query.split("&")) if parsed.query else 0

    # Flags
    is_https = 1 if url_lower.startswith("https://") else 0
    is_http = 1 if url_lower.startswith("http://") else 0

    # Suspicious keywords
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    has_suspicious_keyword = 1 if len(matched_keywords) > 0 else 0

    return {
        "url": url,
        "domain": domain,
        "path": path,
        "url_length": len(url),
        "domain_length": len(domain),
        "path_length": len(path),
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_underscores": num_underscores,
        "num_digits": num_digits,
        "num_special_chars": num_special,
        "subdomain_count": subdomain_count,
        "query_param_count": query_param_count,
        "url_depth": path_depth,
        "is_https": is_https,
        "is_http": is_http,
        "is_ip_host": is_ip_host,
        "has_suspicious_keyword": has_suspicious_keyword,
        "matched_keywords": matched_keywords
    }
