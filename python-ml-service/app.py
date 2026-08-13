import time
import os
import sys
from flask import Flask, request, jsonify
from flasgger import Swagger

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser.log_parser import log_parser_engine
from features.lexical import extract_lexical_features
from features.entropy import extract_entropy_features
from features.traffic import analyze_traffic_behavior
from domain.reputation import domain_reputation_service
from domain.age import domain_age_service
from ml.predictor import prediction_service
from mitre.mapper import mitre_mapper

app = Flask(__name__)
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Python Flask ML URL Classifier Service",
        "description": "Log parsing, lexical/entropy feature extraction, traffic beaconing analysis, ML model prediction (RandomForest / LightGBM), and MITRE ATT&CK mapping.",
        "contact": {
            "name": "SOC Cyber Security Team"
        },
        "version": "1.0.0"
    },
    "basePath": "/"
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

@app.route("/ml/health", methods=["GET"])
def health_check():
    """
    Health Check Endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: ML Microservice operational status
        schema:
          type: object
          properties:
            status:
              type: string
              example: UP
            service:
              type: string
              example: Python Flask ML Microservice
            model_mode:
              type: string
              example: REAL_MODEL
    """
    return jsonify({
        "status": "UP",
        "service": "Python Flask ML Microservice",
        "model_mode": "REAL_MODEL" if prediction_service.is_real_model else "DEMO_MODE"
    }), 200

@app.route("/ml/analyze", methods=["POST"])
def analyze_logs():
    """
    Analyze Proxy Log Content
    ---
    tags:
      - Analysis
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            content:
              type: string
              description: Raw SQUID or Bluecoat proxy log file content
              example: "1712580000.123 150 192.168.1.50 TCP_MISS/200 4500 GET http://malicious-phishing-site.net/login - DIRECT/93.184.216.34 text/html"
            filename:
              type: string
              description: Log file name
              example: "sample_squid_logs.log"
    responses:
      200:
        description: ML Feature Engineering & Prediction Results
      400:
        description: Bad request / Empty log content
    """
    start_time = time.time()
    data = request.get_json() or {}
    log_content = data.get("content", "")
    filename = data.get("filename", "uploaded_proxy.log")

    if not log_content and "file_path" in data and os.path.exists(data["file_path"]):
        with open(data["file_path"], "r", encoding="utf-8", errors="ignore") as f:
            log_content = f.read()

    if not log_content:
        return jsonify({"error": "Empty or missing log content"}), 400

    # 1. Parsing
    records = log_parser_engine.parse_content(log_content)
    if not records:
        return jsonify({"error": "No valid SQUID or Bluecoat proxy log entries found"}), 400

    # 2. Traffic Behavior Analysis (Access frequency & Beaconing timing regularity)
    traffic_summary = analyze_traffic_behavior(records)
    beacon_scores = traffic_summary.get("beacon_scores", {})

    analyzed_events = []
    category_counts = {
        "Benign": 0,
        "Phishing": 0,
        "Malware Distribution": 0,
        "Command and Control": 0,
        "Data Exfiltration": 0
    }

    for rec in records:
        url = rec["url"]
        client_ip = rec["client_ip"]

        # Feature Extraction
        lex_features = extract_lexical_features(url)
        domain = lex_features["domain"]

        entropy_features = extract_entropy_features(url, domain)
        rep_info = domain_reputation_service.get_reputation(domain)
        age_info = domain_age_service.get_domain_age(domain)

        beacon_data = beacon_scores.get(f"{client_ip}:{domain}", {})
        beacon_score = beacon_data.get("beacon_score", 0.0)

        # Combined feature dictionary for ML
        feature_vector = {
            **lex_features,
            **entropy_features,
            "reputation_score": rep_info["score"],
            "domain_age_days": age_info["domain_age_days"],
            "beacon_score": beacon_score
        }

        # 3. ML Prediction (Random Forest / LightGBM)
        ml_res = prediction_service.predict(feature_vector)
        pred_category = ml_res["prediction"]

        if pred_category in category_counts:
            category_counts[pred_category] += 1

        # 4. MITRE ATT&CK Post-Classification Mapping
        mitre_info = mitre_mapper.get_mitre_mapping(pred_category)

        event_payload = {
            "timestamp": rec["timestamp"],
            "client_ip": client_ip,
            "url": url,
            "domain": domain,
            "method": rec["method"],
            "status_code": rec["status_code"],
            "bytes": rec["bytes"],
            "prediction": pred_category,
            "confidence": ml_res["confidence"],
            "execution_mode": ml_res["execution_mode"],
            "model_name": ml_res["model_name"],
            "model_version": ml_res["model_version"],
            "beacon_score": beacon_score,
            "domain_reputation_score": rep_info["score"],
            "domain_age_days": age_info["domain_age_days"],
            "domain_entropy": entropy_features["domain_entropy"],
            "full_url_entropy": entropy_features["full_url_entropy"],
            "mitre_id": mitre_info["technique_id"],
            "mitre_name": mitre_info["technique_name"],
            "mitre_tactic": mitre_info["tactic"],
            "mitre_description": mitre_info["description"]
        }
        analyzed_events.append(event_payload)

    duration_sec = round(time.time() - start_time, 2)
    total_urls = len(analyzed_events)
    benign_count = category_counts["Benign"]
    threat_count = total_urls - benign_count
    malicious_pct = round((threat_count / total_urls * 100.0), 2) if total_urls > 0 else 0.0

    return jsonify({
        "status": "COMPLETED",
        "filename": filename,
        "total_urls": total_urls,
        "benign_count": benign_count,
        "threat_count": threat_count,
        "phishing_count": category_counts["Phishing"],
        "malware_count": category_counts["Malware Distribution"],
        "c2_count": category_counts["Command and Control"],
        "exfiltration_count": category_counts["Data Exfiltration"],
        "malicious_percentage": malicious_pct,
        "processing_time": f"{duration_sec} sec",
        "events": analyzed_events
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
