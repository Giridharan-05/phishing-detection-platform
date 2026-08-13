from typing import List, Dict, Any, Optional
from datetime import datetime
from app.parser.base_parser import BaseLogParser

class BluecoatParser(BaseLogParser):
    def parse_line(self, line: str) -> Optional[Dict[str, Any]]:
        line = line.strip()
        if not line or line.startswith("#"):
            return None
            
        parts = line.split()
        if len(parts) < 7:
            return None
            
        try:
            # Check if line starts with date & time e.g. "2026-07-08 14:22:01"
            date_str = parts[0]
            time_str = parts[1]
            try:
                timestamp = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S").isoformat()
            except ValueError:
                timestamp = datetime.utcnow().isoformat()
                
            client_ip = parts[3]
            try:
                status_code = int(parts[4])
            except ValueError:
                status_code = 200
                
            method = parts[5]
            url = parts[6]
            
            bytes_sent = 0
            if len(parts) > 7:
                try:
                    bytes_sent = int(parts[7])
                except ValueError:
                    bytes_sent = 0

            return {
                "timestamp": timestamp,
                "client_ip": client_ip,
                "method": method,
                "url": url,
                "status_code": status_code,
                "bytes": bytes_sent,
                "parser_type": "BLUECOAT"
            }
        except Exception:
            return None

    def parse_file(self, file_path: str) -> List[Dict[str, Any]]:
        results = []
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                parsed = self.parse_line(line)
                if parsed:
                    results.append(parsed)
        return results
