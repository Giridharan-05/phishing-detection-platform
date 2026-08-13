import statistics
from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any

def analyze_traffic_behavior(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes access frequency features and beaconing regularity score per client IP and domain.
    """
    ip_counts = defaultdict(int)
    domain_counts = defaultdict(int)
    ip_domain_timestamps = defaultdict(lambda: defaultdict(list))

    total_records = len(records)
    unique_domains = set()
    unique_urls = set()

    for rec in records:
        client_ip = rec.get("client_ip", "0.0.0.0")
        url = rec.get("url", "")
        domain = rec.get("domain", "") or url.split("/")[0]

        ip_counts[client_ip] += 1
        domain_counts[domain] += 1
        unique_domains.add(domain)
        unique_urls.add(url)

        # Parse timestamp for interval analysis
        ts_str = rec.get("timestamp", "")
        try:
            dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            ip_domain_timestamps[client_ip][domain].append(dt.timestamp())
        except Exception:
            pass

    # Beaconing Analysis (timing regularity) per client IP -> domain pair
    beacon_scores = {}
    for client_ip, domains in ip_domain_timestamps.items():
        for domain, timestamps in domains.items():
            if len(timestamps) >= 3:
                timestamps.sort()
                intervals = [timestamps[i] - timestamps[i-1] for i in range(1, len(timestamps))]
                avg_interval = statistics.mean(intervals)
                median_interval = statistics.median(intervals)
                stdev_interval = statistics.stdev(intervals) if len(intervals) > 1 else 0.0
                
                # Coefficient of variation (CV) = stdev / mean
                cv = (stdev_interval / avg_interval) if avg_interval > 0 else 1.0

                # High periodicity / beaconing = low variance in intervals (CV < 0.2)
                if cv < 0.15:
                    beacon_score = 95.0
                elif cv < 0.3:
                    beacon_score = 80.0
                elif cv < 0.5:
                    beacon_score = 50.0
                else:
                    beacon_score = 15.0

                beacon_scores[f"{client_ip}:{domain}"] = {
                    "connection_count": len(timestamps),
                    "avg_interval": round(avg_interval, 2),
                    "median_interval": round(median_interval, 2),
                    "stdev_interval": round(stdev_interval, 2),
                    "cv": round(cv, 3),
                    "beacon_score": beacon_score
                }

    return {
        "total_records": total_records,
        "unique_domains_count": len(unique_domains),
        "unique_urls_count": len(unique_urls),
        "ip_counts": dict(ip_counts),
        "domain_counts": dict(domain_counts),
        "beacon_scores": beacon_scores
    }
