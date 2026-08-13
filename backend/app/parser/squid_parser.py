import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.parser.base_parser import BaseLogParser

class SquidParser(BaseLogParser):
    def parse_line(self, line: str) -> Optional[Dict[str, Any]]:
        line = line.strip()
        if not line or line.startswith("#"):
            return None
        
        parts = line.split()
        if len(parts) < 7:
            return None
            
        try:
            # Unix timestamp
            ts_str = parts[0]
            try:
                timestamp = datetime.fromtimestamp(float(ts_str)).isoformat()
            except ValueError:
                timestamp = datetime.utcnow().isoformat()
                
            client_ip = parts[2]
            action_status = parts[3]
            
            status_code = 200
            if "/" in action_status:
                try:
                    status_code = int(action_status.split("/")[1])
                except ValueError:
                    status_code = 200
                    
            try:
                bytes_sent = int(parts[4])
            except ValueError:
                bytes_sent = 0
                
            method = parts[5]
            url = parts[6]
            
            return {
                "timestamp": timestamp,
                "client_ip": client_ip,
                "method": method,
                "url": url,
                "status_code": status_code,
                "bytes": bytes_sent,
                "parser_type": "SQUID"
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
