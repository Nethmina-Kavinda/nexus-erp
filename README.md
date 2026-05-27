# NEXUS ERP

Integrated Enterprise Resource Planning system with ML-powered Employee Risk Scoring.

**Stack:** MongoDB, Express.js, React 18, Node.js, Python Flask, scikit-learn, SHAP

## Architecture

```
Frontend (React + Vite)  ──>  Backend (Express.js)  ──>  ML Service (Flask)
     :3000                         :5001                    :5000
                                     │
                                  MongoDB
                               :27017/nexus_erp
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 6+

### Setup

```bash
# 1. Start MongoDB
mongod --dbpath C:/data/db

# 2. Backend
cd backend
npm install
cp ../.env.example .env    # Edit with your values
npm run seed               # Seeds all collections (~1 second)
npm run dev                # Starts on :5001

# 3. ML Service
cd ml-service
pip install -r requirements.txt
python app.py              # Starts on :5000

# 4. Train the model
curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d '{"stage": "stage_1"}'

# 5. Frontend
cd frontend
npm install
npm run dev                # Starts on :3000
```

### Demo Login
- **Admin:** kavinda@nexus.lk / nexus123
- **HR Manager:** malini@nexus.lk / nexus123

## Modules

| Module | Description |
|---|---|
| HR / Employee Management | Employee profiles, CRUD, role-based access |
| Attendance + Payroll | Check-in/out, automated salary computation (EPF/ETF/penalties) |
| Inventory Management | Dual-tier stock tracking with reorder alerts |
| Risk Scoring Engine | ML-powered employee attrition risk prediction with SHAP explainability |

## ML Pipeline

- **8-feature vector** constructed from attendance, payroll, social signals, and organizational data
- **Synthetic social score** using VAR model (autoregressive + correlated multivariate normal)
- **Random Forest** classifier (200 trees, balanced weights)
- **SHAP TreeExplainer** for per-prediction explainability
- **Two-stage training:** Stage 1 (formula labels) -> Stage 2 (HR-corrected labels)
- **Temporal split:** Months 1-4 train, month 5 validate, month 6 test

## API Endpoints

### Node.js Backend (:5001)
- `POST /api/auth/login` — JWT authentication
- `GET /api/employees` — List employees
- `GET /api/attendance/:empId/monthly` — Monthly summary
- `POST /api/payroll/generate` — Generate payroll
- `GET /api/inventory` — List inventory
- `GET /api/risk/scores` — Risk scores with SHAP
- `GET /api/risk/predict/:empId` — Predict risk for employee
- `POST /api/ml/retrain` — Trigger model retraining
- `POST /api/decisions` — Submit HR accept/reject
- `GET /api/dashboard/summary` — Dashboard KPIs

### Flask ML Service (:5000)
- `GET /health` — Model status
- `POST /predict` — Risk prediction + SHAP values
- `POST /train` — Train/retrain model

## Evaluation

```bash
cd ml-service
python evaluate.py
```

Generates confusion matrices, SHAP plots, feature importance charts, social score validation, and stage comparison metrics in `evaluation_output/`.
