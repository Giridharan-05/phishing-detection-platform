# Identification of URL-Based Attacks from IP Data - Backend API

Production-grade FastAPI prototype backend for analyzing web proxy access logs (SQUID or Bluecoat), classifying URL access events using Machine Learning heuristics and models, mapping threats to MITRE ATT&CK techniques, scoring incident severity, and generating actionable Security Operations Center (SOC) playbooks.

---

## 🚀 Tech Stack

* **Python 3.12+**
* **FastAPI** & **Uvicorn** (Asynchronous Web Server)
* **SQLAlchemy** & **Pydantic v2**
* **PostgreSQL / SQLite** (Dynamic database session management)
* **Pandas** & **Scikit-Learn** & **Joblib** (ML Pipeline & Feature Extraction)
* **Python Logging** & **CORS Middleware**

---

## 📂 Project Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py             # Dependency Injection (DB session, auth)
│   │   └── v1/
│   │       ├── router.py       # Main API Router
│   │       ├── upload.py       # POST /upload-log
│   │       ├── analyze.py      # POST /analyze-log
│   │       ├── dashboard.py    # GET /dashboard
│   │       ├── threats.py      # GET /threats
│   │       ├── analytics.py    # GET /analytics
│   │       └── history.py      # GET /history
│   ├── models/                 # SQLAlchemy Database ORM Models
│   │   ├── user.py
│   │   ├── log.py
│   │   ├── threat.py
│   │   └── report.py
│   ├── schemas/                # Pydantic Schemas & DTOs
│   ├── database/               # Database Engine & Session setup
│   ├── parser/                 # SQUID & Bluecoat Log Parser Engine
│   │   ├── squid_parser.py
│   │   ├── bluecoat_parser.py
│   │   └── log_parser.py
│   ├── feature_engineering/    # URL Feature Extraction & Entropy Calculation
│   │   └── url_features.py
│   ├── ml/                     # ML Model Predictor & Fallback Engine
│   │   └── predictor.py
│   ├── mitre/                  # MITRE ATT&CK Technique Mapper
│   │   └── mapper.py
│   ├── severity/               # Severity Scoring Engine (Critical, High, Medium, Low)
│   │   └── calculator.py
│   ├── recommendations/        # SOC Mitigation Playbook Engine
│   │   └── engine.py
│   ├── services/               # Business Logic Layer
│   ├── utils/                  # Structured Logger
│   ├── config.py               # Pydantic BaseSettings Configuration
│   └── main.py                 # FastAPI Application Bootstrapper
├── uploads/                    # Proxy Log Repository
├── requirements.txt            # Python Dependencies
└── README.md                   # Documentation
```

---

## ⚡ Quick Start & Setup

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Interactive API Documentation (Swagger UI)
Open your browser and navigate to:
* **Swagger UI:** `http://localhost:8000/docs`
* **ReDoc:** `http://localhost:8000/redoc`

---

## 🛡️ REST API Workflow

1. **Upload Log File:** `POST /upload-log`
   * Upload SQUID or Bluecoat proxy log file.
2. **Execute ML Analysis Pipeline:** `POST /analyze-log`
   * Parses entries ➔ Extracts URL features ➔ Predicts attack category ➔ Scores severity ➔ Maps MITRE techniques ➔ Generates recommendations ➔ Stores report in database.
3. **Fetch Dashboard Metrics:** `GET /dashboard`
4. **Fetch Threat Incidents:** `GET /threats`
5. **Fetch Analytics Datasets:** `GET /analytics`
6. **Fetch Audit History:** `GET /history`

---

## 🔮 Future Scalability Plan

The modular architecture allows adding the following without refactoring core APIs:
* **JWT Authentication**: Add `app/api/v1/auth.py` and OAuth2 Bearer dependencies.
* **Threat Intel APIs**: Plug VirusTotal API, AbuseIPDB, and WHOIS lookup into `app/services/threat_intel.py`.
* **Async Workers**: Integrate Celery / Redis / Kafka for high-throughput log file parsing.
* **LLM Threat Summaries**: Add OpenAI/Anthropic/Gemini LLM summary engine in `app/services/llm_summary.py`.
