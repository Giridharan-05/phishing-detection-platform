import re
from typing import List, Dict, Any
from app.parser.squid_parser import SquidParser
from app.parser.bluecoat_parser import BluecoatParser
from app.utils.logger import logger

class LogParserFacade:
    def __init__(self):
        self.squid_parser = SquidParser()
        self.bluecoat_parser = BluecoatParser()

    def detect_format(self, sample_lines: List[str]) -> str:
        for line in sample_lines:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if not parts:
                continue
            # SQUID usually starts with Unix timestamp (numeric with decimal point e.g., 1719830400.123)
            if re.match(r"^\d{10}(\.\d+)?$", parts[0]):
                return "SQUID"
            # Bluecoat starts with Date YYYY-MM-DD
            if re.match(r"^\d{4}-\d{2}-\d{2}$", parts[0]):
                return "BLUECOAT"
        return "GENERIC_URL"

    def parse_log_file(self, file_path: str) -> List[Dict[str, Any]]:
        sample_lines = []
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for _ in range(15):
                line = f.readline()
                if not line:
                    break
                sample_lines.append(line)

        fmt = self.detect_format(sample_lines)
        logger.info(f"Auto-detected log format for '{file_path}': {fmt}")

        if fmt == "SQUID":
            return self.squid_parser.parse_file(file_path)
        elif fmt == "BLUECOAT":
            return self.bluecoat_parser.parse_file(file_path)
        else:
            # Generic fallback: search for URLs line by line
            results = []
            url_pattern = re.compile(r"https?://[^\s\"'>]+")
            ip_pattern = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    urls = url_pattern.findall(line)
                    ips = ip_pattern.findall(line)
                    client_ip = ips[0] if ips else "192.168.1.100"
                    for u in urls:
                        results.append({
                            "timestamp": "2026-07-08T12:00:00Z",
                            "client_ip": client_ip,
                            "method": "GET",
                            "url": u,
                            "status_code": 200,
                            "bytes": len(line),
                            "parser_type": "GENERIC_URL"
                        })
            return results

log_parser_service = LogParserFacade()
