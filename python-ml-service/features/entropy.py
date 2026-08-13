import math
from collections import Counter
from typing import Dict, Any

try:
    from scipy.stats import entropy as scipy_entropy

    def calculate_shannon_entropy(text: str) -> float:
        if not text:
            return 0.0
        counts = list(Counter(text).values())
        return round(float(scipy_entropy(counts, base=2)), 4)
except ImportError:
    def calculate_shannon_entropy(text: str) -> float:
        if not text:
            return 0.0
        entropy = 0.0
        length = len(text)
        for count in Counter(text).values():
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 4)

def extract_entropy_features(url: str, domain: str) -> Dict[str, float]:
    return {
        "domain_entropy": calculate_shannon_entropy(domain),
        "full_url_entropy": calculate_shannon_entropy(url)
    }
