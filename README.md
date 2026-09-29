# NEXUS ERP

Integrated Enterprise Resource Planning system with ML-powered Employee Risk Scoring. Built as a research artefact for a BSc (Hons) Computer Science thesis at NSBM Green University using the Design Science Research Methodology (DSRM).

**Stack:** MongoDB · Express.js · React 18 · Node.js · Python Flask · scikit-learn · SHAP

---

## Architecture

```
Frontend (React + Vite)  ──>  Backend (Express.js)  ──>  ML Service (Flask)
      :3000                          :5001                      :5000
                                       │
                                    MongoDB
                                :27017/nexus_erp
```

The backend always produces a formula-based risk score. If Flask is reachable, it is augmented with a Random Forest prediction and SHAP values. If Flask is down, the system tags the response `ml_status: 'formula_only'` and continues — no degraded UX.

---

## Modules

| Module | Description |
|---|---|
| **HR / Employee Management** | Employee profiles, roles, soft delete, search/filter/paginate |
| **Attendance + Payroll** | Check-in/out, automated salary computation (EPF 8%, ETF 3%, late penalty) |
| **Inventory Management** | Dual-tier stock tracking (raw + finished), automated reorder email alerts |
| **Risk Scoring Engine** | 8-feature ML-powered attrition risk prediction with SHAP explainability and HR feedback loop |

---

## ML Pipeline

- **100-employee** synthetic dataset, 6 months of records per employee
- **8-feature vector** per employee per month: attendance, payroll, social signals, and organisational factors
- **Synthetic social score** modelled with a VAR process (autoregressive + correlated multivariate normal via Cholesky decomposition)
- **Random Forest** classifier — 200 trees, `class_weight='balanced'`, SMOTE oversampling
- **Temporal split:** months 1–4 train · month 5 validate · month 6 test
- **Two-stage training:** Stage 1 (formula labels) → Stage 2 (HR-corrected labels)
- **SHAP TreeExplainer** for per-prediction feature-level explainability

### Evaluation Results

| Metric | Stage 1 | Stage 2 | Delta |
|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — |
| Test Accuracy | 88.0% | 83.0% | -5.0% |
| **F1 (macro)** | **0.592** | **0.836** | **+24.4 pts** |

The +24.4 pt F1 lift from Stage 1 → Stage 2 demonstrates that HR feedback (human-in-the-loop retraining) measurably improves the model's classification across all risk classes.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 6+

### Automated setup (Windows)

```bat
setup.bat
```

Installs all Node and Python dependencies and creates `backend/.env` from the example file.

### Manual setup

```bash
# 1. Start MongoDB
mongod --dbpath C:/data/db

# 2. Backend
cd backend   # execute in a new terminal
npm install                   # done 
cp ../.env.example .env      # edit with your values : done
npm run seed                 # seeds all collections (~3s for 100 employees) : done
npm run dev                  # → http://localhost:5001 : execute 

# 3. ML Service
cd ml-service  # execute 
python -m venv venv  
venv\Scripts\activate        #  execute 
pip install -r requirements.txt # done
python app.py                # → http://127.0.0.1:5000 execute 

# 4. Train both model stages (run once after seeding)
curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_1\"}"
curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_2\"}"

# 5. Frontend
cd frontend
npm install # done
npm run dev                  # → http://localhost:3000
```

## Running the Application (Day-to-Day)

Once `setup.bat` (or the manual setup) has been run **once**, starting the system for normal use only requires 4 terminals — no reinstall, no re-seed, no retrain.

| # | Terminal | Command | URL |
|---|---|---|---|
| 1 | MongoDB | `mongod --dbpath C:\data\db` | `localhost:27017` |
| 2 | Backend | `cd backend && npm run dev` | http://localhost:5001 |
| 3 | ML Service | `cd ml-service && venv\Scripts\activate && python app.py` | http://127.0.0.1:5000 |
| 4 | Frontend | `cd frontend && npm run dev` | http://localhost:3000 |

Start them in this order (each in its own terminal window, left running): **MongoDB → Backend → ML Service → Frontend**. Then open http://localhost:3000 and log in with a demo credential above.

To stop everything, close the four terminal windows (or `Ctrl+C` in each).

> **Only run once, not on every startup:** `npm install` (per folder), `npm run seed` (backend), and the two `/train` calls. Re-run `npm run seed` only if you want to reset the database back to the original synthetic dataset — this will erase any data entered since.

### Production-style run (optional)

For a build instead of the Vite dev server:

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # serves the production build locally
```

The backend can run the same way in production via `npm start` (plain `node server.js`, no file-watching) instead of `npm run dev`.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend fails to start, `MongoNetworkError` | MongoDB isn't running | Start `mongod` first, confirm it's listening on `27017` |
| Risk scores show `ml_status: 'formula_only'` | Flask ML service is down or not trained | Start `ml-service` (`python app.py`), then re-run the two `/train` calls if this is a fresh database |
| Login fails for demo users | Database hasn't been seeded | `cd backend && npm run seed` |
| Frontend loads but API calls fail (network error) | Backend not running, or wrong port | Confirm backend is up at http://localhost:5001 and `frontend/.env` (if present) points to it |
| `python app.py` errors with missing module | Virtual environment not activated | `cd ml-service && venv\Scripts\activate` before running |
| Port already in use (`EADDRINUSE`) | A previous instance is still running | Close the old terminal, or find and kill the process on that port |

---

## API

Full endpoint reference is in [`backend/README.md`](backend/README.md).

### Node.js Backend (`localhost:5001`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | JWT login |
| GET | `/api/employees` | List employees (filters + pagination) |
| GET | `/api/attendance/:empId/monthly` | Monthly attendance summary |
| POST | `/api/payroll/generate` | Auto-generate monthly payroll |
| GET | `/api/inventory` | List inventory with reorder flags |
| GET | `/api/risk/scores` | All risk scores with SHAP |
| GET | `/api/risk/predict/:empId` | Fresh risk prediction for one employee |
| POST | `/api/ml/retrain` | Trigger model retraining (stage_1 or stage_2) |
| POST | `/api/decisions` | HR accept / reject a prediction |
| GET | `/api/dashboard/summary` | All KPIs in one request |

### Flask ML Service (`127.0.0.1:5000`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Model status + metadata |
| POST | `/predict` | RF prediction + 8 SHAP values |
| POST | `/train` | Retrain (stage_1 or stage_2) |

---

## Evaluation Artifacts

```bash
cd ml-service
python evaluate.py
```

Generates 12 artifacts in `ml-service/evaluation_output/` for thesis Chapter 5: confusion matrices, feature importance charts, SHAP summary, SHAP drift, n_estimators tuning curve, social score validation plots, feature correlation matrix, and a machine-readable `evaluation_results.json`.

---

## Project Structure

```
system/
├── backend/                    Node.js + Express API (45 files)
│   ├── config/                 MongoDB connection
│   ├── middleware/             JWT auth, error handler
│   ├── models/                 9 Mongoose schemas
│   ├── controllers/            8 controller modules
│   ├── routes/                 8 route modules
│   ├── seeds/                  8-step seed pipeline + runner
│   └── utils/                  payroll, risk scoring, ML client, SHAP→text, email
├── frontend/                   React 18 + Vite (19 files)
│   └── src/
│       ├── pages/              Login, Dashboard, Employees, Attendance, Payroll, Inventory, RiskScoring
│       ├── components/         Sidebar, Topbar, KPICard, RiskBadge, Toast
│       ├── context/            AuthContext (JWT + role)
│       └── services/           API service layer
├── ml-service/                 Python Flask ML microservice (5 files)
│   ├── app.py                  /health, /predict, /train endpoints
│   ├── model.py                RiskModel — train, predict, SHAP
│   ├── config.py               FEATURE_NAMES, CLASS_NAMES, paths
│   ├── evaluate.py             Thesis Ch.5 artifact generator
│   └── evaluation_output/      12 charts + metrics JSON (git-ignored)
├── docs/                       Project plan, status, walkthrough
├── research_docs/              SLR, paper summaries, source of truth
├── .env.example                Environment variable template
└── setup.bat                   One-shot Windows setup script
```

---

## Research Context

**Thesis:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals

**University:** NSBM Green University — BSc (Hons) Computer Science

**Methodology:** Peffers' Design Science Research Methodology (DSRM)

**Three research contributions:**
1. Synthetic social score modelled as a VAR process with documented production pathway (schema field `social_data_source` transitions `synthetic` → `linkedin_api` with zero migration)
2. Integrated 8-feature risk scoring pipeline inside a lightweight MERN ERP
3. Human-in-the-loop ML retraining loop — HR accept/reject decisions become Stage 2 ground truth
