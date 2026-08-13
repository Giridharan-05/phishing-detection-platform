from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseLogParser(ABC):
    @abstractmethod
    def parse_line(self, line: str) -> Dict[str, Any]:
        """Parses a single log line into a standardized dictionary."""
        pass

    @abstractmethod
    def parse_file(self, file_path: str) -> List[Dict[str, Any]]:
        """Parses an entire log file into a list of structured dictionaries."""
        pass
