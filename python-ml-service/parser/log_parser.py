from typing import List, Dict, Any
from parser.squid_parser import SquidParser
from parser.bluecoat_parser import BluecoatParser

class LogParserEngine:
    def __init__(self):
        self.squid_parser = SquidParser()
        self.bluecoat_parser = BluecoatParser()

    def parse_content(self, text_content: str) -> List[Dict[str, Any]]:
        lines = [line.strip() for line in text_content.splitlines() if line.strip() and not line.startswith("#")]
        if not lines:
            return []

        # Auto-detect format from first non-comment line
        first_line = lines[0]
        parts = first_line.split()

        parser = self.squid_parser
        if len(parts) >= 2 and ("-" in parts[0] or ":" in parts[1]):
            parser = self.bluecoat_parser

        parsed_records = []
        for line in lines:
            parsed = parser.parse_line(line)
            if parsed:
                parsed_records.append(parsed)

        return parsed_records

log_parser_engine = LogParserEngine()
