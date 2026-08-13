# AI-Driven URL Threat Detection and Security Analytics Platform

Enterprise-grade **Spring Boot 3 + Spring Cloud Netflix Eureka + JWT Authentication + Microservices + MySQL** architecture with an isolated **Python Flask Machine Learning Microservice** for web proxy log batch threat classification (SQUID / Bluecoat).

---

## 🏗️ System Architecture

```
                                +----------------------+
                                |    React Frontend    | (Port 3000 / 5173)
                                +----------------------+
                                           │
                                     HTTP / JWT Token
                                           ▼
                                +----------------------+
                                | Spring Cloud Gateway | (Port 8080)
                                +----------------------+
                                           │
                       ┌────────────────────┴────────────────────┐
                       │    Eureka Service Discovery (:8761)     │
                       └────────────────────┬────────────────────┘
                                           │
            ┌───────────────────────────────┼───────────────────────────────┐
            ▼ (lb://AUTH-SERVICE)           ▼ (lb://ANALYSIS-SERVICE)       ▼ (lb://DASHBOARD-SERVICE)
 +--------------------+           +--------------------+           +--------------------+
 |  Auth Service      |           |  Analysis Service  |           | Dashboard Service  |
 |  (Port 8081)       |           |  (Port 8082)       |           | (Port 8083)        |
 +--------------------+           +--------------------+           +--------------------+
           │                                │                               │
           │                        REST / OpenFeign                        |
           │                                ▼                               │
           │                       +------------------+                     │
           │                       | Python Flask ML  |                     │
           │                       | (Port 5000)      |                     │
           │                       +------------------+                     │
           │                                │                               │
           ▼                                ▼                               ▼
 +------------------------------------------------------------------------------------+
 |                                 MySQL DB (Port 3306)                               |
 +------------------------------------------------------------------------------------+
```

---

## 📖 Interactive Swagger / OpenAPI Documentation

Every Spring Boot microservice and the Python Flask ML microservice expose interactive Swagger UI documentation supporting **JWT Bearer Token Authorization** ("Authorize" button) and **Multipart File Upload Testing**:

* **Spring Cloud Gateway**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
* **Auth Service**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
* **Analysis Service**: [http://localhost:8082/swagger-ui/index.html](http://localhost:8082/swagger-ui/index.html)
* **Dashboard Service**: [http://localhost:8083/swagger-ui/index.html](http://localhost:8083/swagger-ui/index.html)
* **Python Flask ML Service**: [http://localhost:5000/apidocs/](http://localhost:5000/apidocs/)

---

## 🔑 JWT Authentication Workflow

1. User registers or logs in via `POST /api/v1/auth/login` on API Gateway (`http://localhost:8080`).
2. Gateway routes request to `lb://AUTH-SERVICE`.
3. Auth Service verifies BCrypt password hash and generates an HMAC-SHA512 signed JWT access token containing user roles (`ROLE_ADMIN`, `ROLE_ANALYST`).
4. React frontend stores JWT in `localStorage` and automatically attaches `Authorization: Bearer <token>` to all HTTP requests via Axios interceptor.
5. `gateway-service` validates the JWT token before routing requests to downstream microservices.

---

## ⚡ End-to-End Analysis Workflow

1. **Upload**: User uploads `sample_squid_logs.log` in React UI -> Gateway (`:8080`) -> `analysis-service` (`:8082`).
2. **ML Ingestion**: `analysis-service` calls `python-ml-service` (`:5000`) via Spring Cloud OpenFeign.
3. **Feature Engineering & ML**: Python service parses lines, extracts lexical URL features, calculates Scipy Shannon Entropy, analyzes access frequency, calculates beaconing regularity timing scores, queries domain reputation/age, runs Random Forest/LightGBM prediction, and attributes MITRE ATT&CK techniques.
4. **Risk & Containment**: `analysis-service` computes Risk Score (0-100), maps Severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), generates containment actions, and saves `analysis_batch`, `threat_event`, and `containment_action` to MySQL.
5. **Popup**: `analysis-service` returns JSON `AnalysisSummaryResponse`. React UI automatically renders the **Analysis Summary Popup**.
6. **History**: Clicking an analyzed log in History executes `GET /api/v1/analysis/{id}` which retrieves the exact stored summary from MySQL and displays the same popup.

---

## 🚀 Running Locally (Native Execution Order)

Make sure MySQL 8.0+ is running locally on port `3306` with database `psp_cyber_db`.

### Startup Order:

1. **Start MySQL Database**:
   Create database `psp_cyber_db` (credentials: `root` / `root` or update `application.yml`).

2. **Start Eureka Server** (Port `8761`):
   ```powershell
   cd eureka-server
   .\mvnw.cmd spring-boot:run
   ```

3. **Start Auth Service** (Port `8081`):
   ```powershell
   cd auth-service
   .\mvnw.cmd spring-boot:run
   ```

4. **Start Analysis Service** (Port `8082`):
   ```powershell
   cd analysis-service
   .\mvnw.cmd spring-boot:run
   ```

5. **Start Dashboard Service** (Port `8083`):
   ```powershell
   cd dashboard-service
   .\mvnw.cmd spring-boot:run
   ```

6. **Start Gateway Service** (Port `8080`):
   ```powershell
   cd gateway-service
   .\mvnw.cmd spring-boot:run
   ```

7. **Start Python Flask ML Service** (Port `5000`):
   ```powershell
   cd python-ml-service
   python app.py
   ```

8. **Start React Frontend** (Port `3000`):
   ```powershell
   npm run dev
   ```
