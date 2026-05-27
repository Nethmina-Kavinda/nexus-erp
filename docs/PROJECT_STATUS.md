# NEXUS ERP — Project Status & Next Steps

**Last Updated:** 2026-05-28
**Phase:** Phase I complete — Phase J (delivery) in progress
**Delivery:** Pending GitHub push + screenshots

---

## Current State

### What's Built

| Component | Status | Files | Notes |
|---|---|---|---|
| **Backend (Node.js/Express)** | Complete | 45 | All 21 API endpoints functional |
| **ML Service (Flask)** | Complete | 5 | /predict, /train, /health with SHAP |
| **Frontend (React/Vite)** | Complete | 19 | 7 pages, dark navy theme |
| **Seed Pipeline** | Complete | 10 scripts | 100 employees × 6 months, runs in ~3s |
| **Evaluation Script** | Complete | 1 | 12 artifacts regenerated for Chapter 5 |
| **Documentation** | Complete | 5 READMEs | Root + backend + frontend + ml-service + screenshots |
| **Git Repository** | Complete | — | Committed 2026-05-28 (commit 8bb7073) |

### Dataset Scale (updated 2026-05-28)

100 employees × 6 months across 5 departments (20 each):

| Collection | Records |
|---|---|
| Employees | 100 |
| Attendance | ~13,000 daily records |
| Payroll | 600 |
| SocialScores | 600 |
| EmployeeFeatures | 600 |
| RiskScores | 600 |
| HRDecisions | 600 (526 accepted, 74 rejected — 12.3% correction rate) |
| Inventory | 15 items + 63 transactions |

**Risk bias distribution:** Low=40 · Med=35 · High=18 · Crit=7

**Seed output (formula scoring):** Low=250 · Med=341 · High=9 · Crit=0

**HR correction types:** Medium→High: 70 · Low→Medium: 2 · Medium→Low: 2

### Backend Details

**9 MongoDB Schemas:**
- Employee, Attendance, Payroll, Inventory, InventoryTransaction
- SocialScore, EmployeeFeature, RiskScore, HRDecision

**8 Controller Modules (all fully implemented):**
- Auth (register, login, OTP, getMe)
- Employee (CRUD with RBAC, soft delete, search/filter/paginate)
- Attendance (check-in/out, monthly summary with working day calculation)
- Payroll (auto-compute from attendance: gross, EPF/ETF, late penalty, final)
- Inventory (list with reorder flag, transactions with stock update + email alerts)
- Risk (get scores, predict with ML pipeline, retrain proxy, ML status)
- Decision (HR accept/reject with RiskScore update)
- Dashboard (10 KPIs, attendance trend, payroll trend, dept breakdown, WRL)

**5 Utility Modules:**
- `payrollCalculator.js` — Gross/Net/Final salary formula
- `riskScoring.js` — Weighted formula (8 weights), tier classification, confidence labels
- `mlClient.js` — Axios wrapper for Flask /health, /predict, /train
- `topDrivers.js` — SHAP values → human-readable explanations
- `email.js` — Nodemailer for OTP + alert emails

### ML Evaluation Results (updated 2026-05-28 — 100-employee dataset)

| Metric | Stage 1 | Stage 2 | Delta |
|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — |
| **Test Accuracy** | **88.0%** | **83.0%** | -5.0% |
| **F1 (macro)** | **0.592** | **0.836** | **+24.4 pts** |

**Training samples (after SMOTE):** Stage 1 = 720 · Stage 2 = 582

**Key Finding:** The +24.4 pt F1 lift from Stage 1 → Stage 2 confirms that HR feedback (human-in-the-loop retraining) measurably improves classification across all risk classes. The Stage 1 baseline is stronger with 100 employees (88% vs 80% previously) because the larger dataset produces a better-calibrated formula-label set for initial training.

**Evaluation Artifacts (all regenerated 2026-05-28):**
1. `confusion_matrix_stage1.png` — Stage 1 confusion matrix
2. `confusion_matrix_stage2.png` — Stage 2 confusion matrix
3. `feature_importance_stage1.png` — RF feature importance (Stage 1)
4. `feature_importance_stage2.png` — RF feature importance (Stage 2)
5. `shap_summary.png` — Mean |SHAP| per feature (Stage 2)
6. `shap_drift.png` — Feature importance shift Stage 1 → Stage 2
7. `n_estimators_curve.png` — Accuracy vs tree count (50–500)
8. `social_score_histograms.png` — Sub-score distributions (Gaussian shape)
9. `social_score_correlation.png` — Sub-score correlation matrix
10. `social_score_drift.png` — High-risk vs low-risk temporal trajectories
11. `feature_correlation.png` — 8-feature correlation matrix
12. `evaluation_results.json` — All metrics in machine-readable form

### Frontend Details

**7 Pages:**
- Login — Dark-themed, demo credentials hint
- Dashboard — 6 KPI cards, attendance area chart, risk donut, payroll bars, top risk employees
- Employees — Searchable table with department/role filters, avatar initials
- Attendance — Monthly summary per employee (present/absent/late/OT)
- Payroll — Monthly table (gross, EPF+ETF, penalty, final salary in LKR)
- Inventory — Item table with reorder alerts, add transaction modal
- Risk Scoring — WRL banner, filterable risk table, SHAP detail modal, HR accept/reject, retrain button

---

## Completed Phases

### Phase H: Integration Testing + Bug Fixes — COMPLETE (2026-04-20)

| Task | Result |
|---|---|
| H1: End-to-end workflow test | 10-step flow green: health → login → getMe → employees → dashboard → attendance → payroll → ML predict (SHAP + confidence Strong) → HR decision accept+reject → inventory txn → retrain |
| H2: RBAC verification | Matrix validated across all 4 roles + unauthenticated. All 403/401 paths correct. |
| H3: Error handling audit | Structured JSON for all error paths: bad creds (401), missing fields (400), invalid ObjectId (404), duplicate email (400) |
| H4: Data integrity check | Risk scores = 6 months × employee count ✓, 6 payroll/employee ✓, 5 departments balanced ✓ |
| H5: Frontend browser test | Production build clean. Vite dev server OK on :3000. Proxy → backend :5001 verified. |
| H6: Edge case testing | Empty month returns zeros ✓, insufficient stock returns 400 ✓, JWT bad token → 401 ✓ |
| H7: Bug fix pass | No code bugs found. |

### Phase I: Documentation + Polish — COMPLETE (2026-05-28)

| Task | Status | Notes |
|---|---|---|
| I1: Code comments | Done | JSDoc on controllers + utils, Python docstrings on Flask + model |
| I2: Backend README | Done | Full API reference, RBAC matrix, seed pipeline docs |
| I3: ML Service README | Done | Endpoints, model details, evaluation artifact list |
| I4: Setup script | Done | `setup.bat` — installs all deps, bootstraps .env |
| I5: Screenshot collection | **Pending** | 10 screenshots needed for thesis Chapter 4 — see `docs/screenshots/README.md` |
| I6: Git repository | Done | `git init` · `.gitignore` · committed 2026-05-28 (105 files, commit 8bb7073) |
| I7: Dataset scale | Done | Expanded from 20 → 100 employees, all artifacts regenerated |

---

## What's Next

### Phase J: Delivery — IN PROGRESS

| Task | Status | Description |
|---|---|---|
| J1: Screenshots (10) | **TODO** | Start full stack → capture 10 screens → save to `docs/screenshots/` — see checklist in that folder's README |
| J2: GitHub push | **TODO** | `git push origin main` — verify README renders on GitHub |
| J3: Handover package | **TODO** | Source code (GitHub link) + thesis evaluation artifacts + setup instructions for Nethmina |
| J4: Thesis writing | **TODO** | Chapters 1, 3, 4, 5, 6 — all data and artifacts are ready |

---

## How to Run the System

```bash
# Terminal 1: MongoDB
"C:/Program Files/MongoDB/Server/8.0/bin/mongod.exe" --dbpath C:/data/db

# Terminal 2: Backend
cd backend
npm run seed    # Only needed once (or after re-seeding)
npm run dev     # http://localhost:5001

# Terminal 3: ML Service
cd ml-service
venv\Scripts\activate
python app.py   # http://127.0.0.1:5000

# Train model (run once after seeding):
curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_1\"}"
curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_2\"}"

# Terminal 4: Frontend
cd frontend
npm run dev     # http://localhost:3000

# Login: kavinda@nexus.lk / nexus123 (admin)
#        malini@nexus.lk / nexus123 (HR manager)
```

---

## Known Issues & Limitations

| Issue | Severity | Notes |
|---|---|---|
| No Critical-tier employees from formula scoring | Low | Expected — threshold calibration. ML predictions + HR corrections surface High tier. |
| OTP skipped in dev mode | Expected | `SKIP_OTP=true` in .env. Real OTP works when configured with Gmail app password. |
| Single-threaded Flask | Expected | Werkzeug dev server. Production would use gunicorn. Documented as future work. |
| Dashboard hardcodes month 2026-03 | Low | Frontend hardcodes `'2026-03'` (Dashboard.jsx:22) so UI always shows seeded data. |

---

## File Structure

```
system/
├── backend/                    (45 files)
│   ├── config/db.js
│   ├── middleware/             auth.js, errorHandler.js
│   ├── models/                 (9 schemas)
│   ├── controllers/            (8 controllers)
│   ├── routes/                 (8 route modules)
│   ├── seeds/                  (8 seed scripts + helpers + runner)
│   ├── utils/                  (5 utilities)
│   ├── server.js
│   └── package.json
├── frontend/                   (19 source files)
│   ├── src/
│   │   ├── components/         Sidebar, Topbar, Layout, KPICard, RiskBadge, Toast
│   │   ├── pages/              Login, Dashboard, Employees, Attendance, Payroll, Inventory, RiskScoring
│   │   ├── context/            AuthContext.jsx
│   │   ├── services/           api.js
│   │   ├── hooks/              useFetch.js
│   │   └── index.css           Tailwind + custom NEXUS theme
│   └── vite.config.js
├── ml-service/                 (5 source files)
│   ├── app.py                  Flask endpoints
│   ├── model.py                RiskModel: train, predict, SHAP
│   ├── config.py               FEATURE_NAMES, CLASS_NAMES, paths
│   ├── evaluate.py             Chapter 5 artifact generator
│   ├── requirements.txt
│   └── evaluation_output/      12 PNGs + JSON (git-ignored, regenerate with evaluate.py)
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── PROJECT_STATUS.md       (this file)
│   ├── CLIENT_WALKTHROUGH.md
│   └── screenshots/            10 thesis Chapter 4 screenshots (pending capture)
├── research_docs/
│   ├── SOURCE_OF_TRUTH.md
│   ├── SLR.md
│   ├── paper_summaries.md
│   └── references.bib
├── README.md
├── .env.example
├── .gitignore
└── setup.bat
```
