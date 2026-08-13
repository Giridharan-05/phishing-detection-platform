import os
import time
from typing import Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.parser.log_parser import log_parser_service
from app.feature_engineering.url_features import url_feature_extractor
from app.ml.predictor import prediction_service
from app.mitre.mapper import mitre_mapper
from app.severity.calculator import severity_calculator
from app.recommendations.engine import recommendation_engine
from app.models.log import LogFile
from app.models.threat import ThreatEvent
from app.models.report import AnalysisReport
from app.models.summary import AnalysisSummary
from app.utils.logger import logger

class AnalysisService:
    def analyze_log_file(self, filename: str, db: Session) -> Dict[str, Any]:
        """Executes full URL-based attack identification pipeline on a log file and generates an Analysis Summary."""
        start_time = time.time()
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            fallback_path = os.path.join(settings.UPLOAD_DIR, "..", filename)
            if os.path.exists(fallback_path):
                file_path = fallback_path
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Log file '{filename}' not found in upload repository. Please upload file first via POST /upload-log."
                )

        logger.info(f"Starting complete security analysis pipeline on '{filename}'...")
        
        # 1. Parse Log File
        parsed_entries = log_parser_service.parse_log_file(file_path)
        if not parsed_entries:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse any valid URL log entries from '{filename}'. Unsupported log format or empty file."
            )

        total_urls = len(parsed_entries)
        benign_count = 0
        threat_count = 0
        phishing_count = 0
        malware_count = 0
        c2_count = 0
        exfiltration_count = 0

        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0

        threat_items: List[Dict[str, Any]] = []

        # Find or create LogFile record in DB
        log_record = db.query(LogFile).filter(LogFile.filename == filename).order_by(LogFile.id.desc()).first()
        if not log_record:
            log_record = LogFile(filename=filename, file_path=file_path, total_records=total_urls, status="PROCESSED")
            db.add(log_record)
            db.commit()
            db.refresh(log_record)
        else:
            log_record.total_records = total_urls
            log_record.status = "PROCESSED"
            db.commit()

        # 2. Process each URL through ML, Severity, MITRE, Recommendation
        for entry in parsed_entries:
            raw_url = entry.get("url", "")
            client_ip = entry.get("client_ip", "192.168.1.100")
            
            # Feature extraction
            features = url_feature_extractor.extract_features(raw_url)
            
            # ML Prediction
            category, confidence = prediction_service.predict(features)
            
            # Severity calculation
            severity, severity_score = severity_calculator.calculate_severity(category, confidence, features)
            
            # MITRE ATT&CK mapping
            mitre_info = mitre_mapper.get_mitre_mapping(category)
            mitre_code = mitre_info.get("technique_id", "N/A")
            
            # SOC Recommendation
            recommendation = recommendation_engine.generate_recommendation(category, severity, features.get("domain", ""))

            cat_str = (category or "").lower()
            if category == "Benign":
                benign_count += 1
            else:
                threat_count += 1
                if "phishing" in cat_str:
                    phishing_count += 1
                elif "malware" in cat_str:
                    malware_count += 1
                elif "command" in cat_str or "c2" in cat_str:
                    c2_count += 1
                elif "exfiltration" in cat_str:
                    exfiltration_count += 1
                else:
                    phishing_count += 1

                if severity == "Critical":
                    critical_count += 1
                elif severity == "High":
                    high_count += 1
                elif severity == "Medium":
                    medium_count += 1
                else:
                    low_count += 1

                # Save threat event to database
                threat_db = ThreatEvent(
                    log_id=log_record.id,
                    url=raw_url,
                    client_ip=client_ip,
                    category=category,
                    confidence=confidence,
                    severity=severity,
                    severity_score=severity_score,
                    mitre_technique=mitre_code,
                    recommendation=recommendation
                )
                db.add(threat_db)

                # Append to response list
                threat_items.append({
                    "url": raw_url,
                    "client_ip": client_ip,
                    "prediction": category,
                    "confidence": confidence,
                    "severity": severity,
                    "severity_score": severity_score,
                    "mitre": mitre_code,
                    "recommendation": recommendation
                })

        duration_sec = round(time.time() - start_time, 2)
        processing_time_str = f"{duration_sec} sec"
        malicious_pct = round((threat_count / total_urls * 100) if total_urls > 0 else 0.0, 2)

        # 3. Create & Save AnalysisSummary
        analysis_summary_record = AnalysisSummary(
            log_id=log_record.id,
            file_name=filename,
            total_urls=total_urls,
            benign_count=benign_count,
            threat_count=threat_count,
            phishing_count=phishing_count,
            malware_count=malware_count,
            c2_count=c2_count,
            exfiltration_count=exfiltration_count,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            malicious_percentage=malicious_pct,
            processing_time=processing_time_str,
            report_status="completed"
        )
        db.add(analysis_summary_record)

        # Save legacy Analysis Report to database for backward compatibility
        report = AnalysisReport(
            log_id=log_record.id,
            report_name=f"Analysis Report - {filename}",
            total_urls=total_urls,
            benign_count=benign_count,
            threat_count=threat_count,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            summary_json={
                "parser_type": parsed_entries[0].get("parser_type", "AUTO_DETECT") if parsed_entries else "UNKNOWN",
                "malicious_percentage": malicious_pct,
                "processing_time": processing_time_str
            }
        )
        db.add(report)
        db.commit()
        db.refresh(analysis_summary_record)

        logger.info(f"Analysis complete for '{filename}': {total_urls} URLs ({benign_count} Benign, {threat_count} Malicious) in {processing_time_str}.")

        summary_dict = {
            "total_urls": total_urls,
            "benign": benign_count,
            "threats": threat_count,
            "phishing": phishing_count,
            "malware": malware_count,
            "c2": c2_count,
            "exfiltration": exfiltration_count,
            "critical": critical_count,
            "high": high_count,
            "medium": medium_count,
            "low": low_count,
            "malicious_percentage": malicious_pct,
            "processing_time": processing_time_str
        }

        return {
            "status": "completed",
            "file_name": filename,
            "analysis_summary": summary_dict,
            "summary": {
                "total_processed_logs": total_urls,
                "total_threats": threat_count,
                "benign": benign_count,
                "malicious_percentage": malicious_pct,
                "processing_time": processing_time_str
            },
            "threats": threat_items
        }

analysis_service = AnalysisService()

