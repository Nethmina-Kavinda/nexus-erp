# NEXUS ERP — Client Walkthrough

*A single-read guide for executives, technical stakeholders, and demo presenters.*

---

## 1. One-Paragraph Pitch

**NEXUS ERP is an integrated HR, payroll, and inventory platform with an explainable AI engine that predicts which employees are at risk of leaving — and lets HR managers correct the model's judgment so it gets smarter over time.** The system ingests signals that HR already collects (attendance, payroll, tenure, department) plus a synthetic proxy for social-media engagement, feeds them into a Random Forest classifier, and uses SHAP to explain *why* each employee was flagged. When HR overrides a prediction, that correction becomes training data for the next retrain. In practice, going from a cold-start model to one trained on HR corrections lifted macro F1 from **0.586 to 0.945** on the held-out month — a 36-point jump that is the headline number of the research.

---

## 2. Architecture at a Glance

```
┌────────────────┐    HTTP    ┌──────────────────┐    HTTP    ┌─────────────────┐
│ React Frontend │ ─────────> │ Express Backend  │ ─────────> │  Flask ML API   │
│ Vite :3000     │            │ :5001 (Node.js)  │            │ :5000 (Python)  │
└────────────────┘            └──────────────────┘            └─────────────────┘
                                       │                               │
                                       ▼                               ▼
                              ┌──────────────────┐              Random Forest
                              │ MongoDB :27017   │              + SHAP
                              │ nexus_erp        │              model.pkl
                              └──────────────────┘
```

**Why this split?**
- **Frontend / Backend** separation so the UI can be rebuilt (mobile, web, kiosk) without touching business logic.
- **Backend / ML service** separation because Python has scikit-learn and SHAP, Node has the HR domain and auth. They talk over HTTP with tight timeouts (3 s health, 5 s predict, 30 s train).
- **Graceful degradation**: if the ML service is down, the backend falls back to the deterministic risk formula and tags the record `ml_status: 'formula_only'`. No service outage.

---

## 3. Module Walkthrough

Each module answers: *what it does → key rules → where in code → what the client will see.*

### Authentication & Roles
JWT login with Bearer tokens; four roles — `admin`, `hr_manager`, `manager`, `employee` — enforced by `authorize(...roles)` middleware on sensitive routes. Production flow has an email OTP step; the demo has `SKIP_OTP=true` to keep login fast.
- Source: `backend/middleware/auth.js`, `backend/controllers/authController.js:77-154`
- UI: single-field login screen, demo-account quick-fill buttons.

### Employees
CRUD with a role-escalation guard: only admins can assign the `admin` role. Deletes are soft (`is_active=false`) so history stays intact. The schema holds a hidden `risk_bias` field never exposed to clients — used only to generate realistic seed attendance.
- Source: `backend/controllers/employeeController.js`
- UI: searchable, department-filterable directory.

### Attendance
Check-in at 9:00 AM. Every minute past that is a `late_minute`; if `late_minutes > 0` the day's status flips to `late`. Check-out after 5:00 PM counts as `overtime_hours`. Monthly summary counts weekdays only as working days.
- Source: `backend/controllers/attendanceController.js`
- UI: monthly summary table — present / absent / late / overtime per employee.

### Payroll
Automatically computed from attendance. Exact formula (LKR):

```
gross      = present_days × 8 × hourly_rate
           + overtime_hours × hourly_rate × 1.5
           + allowances
EPF        = 0.08 × gross          (Employees' Provident Fund)
ETF        = 0.03 × gross          (Employees' Trust Fund)
net        = gross − EPF − ETF
late_penalty = total_late_minutes × 50
final      = max(0, net − late_penalty)
```

Idempotent upsert per `(employee, month)` — re-running never double-charges.
- Source: `backend/utils/payrollCalculator.js:33-57`
- UI: per-employee salary breakdown with every component visible.

### Inventory
Two categories: `raw_material` and `finished_good`. The `needs_reorder` flag is live-computed as `quantity ≤ reorder_level` (not stored). A shipment that crosses the threshold triggers an email to all admins and managers.
- Source: `backend/controllers/inventoryController.js:45-92`
- UI: stock table with alert badges + "Add Transaction" modal.

### Dashboard
One aggregation endpoint returns 11 KPIs, including the **Workforce Risk Level (WRL)** — the percentage of active employees currently sitting in High or Critical risk. This is the single number an executive should watch month-over-month.
- Source: `backend/controllers/dashboardController.js:21-157`
- UI: 6 KPI cards + attendance/risk/payroll charts + top-5 risky employees.

---

## 4. The Risk Scoring Engine — Deep Dive

This is the system's reason for existing. It's worth walking through in order.

### 4.1 Eight features, all normalized to [0, 1]

| Feature | What it captures | Source module |
|---|---|---|
| `absence_rate` | disengagement | attendance |
| `late_rate` | commitment | attendance |
| `overtime_ratio` | burnout / overwork | attendance |
| `productivity_index` | output shortfall | payroll + attendance |
| `payroll_variance` | salary instability | payroll |
| `social_score` | digital disengagement (synthetic proxy) | VAR model |
| `tenure_months` | stability (inverted so newer = riskier) | employee record |
| `department_risk` | peer contagion | aggregated, leave-one-out |

### 4.2 Three engineering choices that matter

These are what separate the pipeline from a naive model:

1. **Sliding-window blend** (60% current month + 30% previous + 10% two-months-ago) — smooths single-month noise so one bad week doesn't spike the score.
2. **Leave-one-out `department_risk`** — an employee's own score is explicitly excluded when computing their department's average. Prevents target leakage.
3. **Min-max normalization across the full dataset** — stretches every feature to `[0, 1]` so the formula and the model see comparable scales.

Source: `backend/seeds/05_seedFeatureVectors.js:25-278`

### 4.3 The synthetic social_score — the research contribution

HR systems can't legally pull LinkedIn activity without consent, so `social_score` is generated by a **Vector Auto-Regressive (VAR) model** that mimics realistic social-media behavior. It can be swapped for a real LinkedIn API feed with zero schema change (the record already carries a `social_data_source` field).

Four sub-scores are generated per employee per month:

- `job_search` (weight 0.35) — LinkedIn job-browsing intensity
- `post_drop` (weight 0.25) — drop in posting frequency
- `network_growth` (weight 0.20) — new recruiter connections
- `sentiment` (weight 0.20) — negativity in posts

Each evolves as:

```
sub_score(t) = 0.65 × sub_score(t-1) + 0.35 × MVN_sample
```

Where `MVN_sample` is drawn from a 4×4 correlated multivariate normal via **Cholesky decomposition**. Final:

```
social_score = 0.35·job_search + 0.25·post_drop + 0.20·network_growth + 0.20·sentiment
```

**Why VAR, not uniform random?**
- **Temporal persistence** — 65% of this month's score carries forward. Humans don't flip engaged↔disengaged overnight.
- **Cross-signal correlation** — someone searching for jobs also posts less. The correlation matrix captures that.

Source: `backend/seeds/04_seedSocialScores.js`, `backend/seeds/utils/helpers.js:20-60`

### 4.4 Two pipelines, one decision

Both run on every prediction.

**Formula pipeline** — a transparent weighted sum of the 8 features:

```
risk_score = 100 × (
    0.25·social_score     + 0.20·absence_rate
  + 0.15·productivity_idx + 0.10·late_rate
  + 0.10·overtime_ratio   + 0.10·department_risk
  + 0.05·payroll_variance + 0.05·tenure_months
)
```

Weights sum to 1.0. Thresholds: `≤25 Low`, `≤50 Medium`, `≤75 High`, `>75 Critical`.
Source: `backend/utils/riskScoring.js:20-55`

**ML pipeline** — Random Forest with 200 trees and balanced class weights. Each prediction returns a class, a confidence, and SHAP values for all 8 features.
Source: `ml-service/model.py:182-188`

**The handoff** — backend calls `GET /health` on Flask first (3 s timeout). If it's up, call `POST /predict`; otherwise use the formula and record `ml_status: 'formula_only'`. Either way the UI gets a row.
Source: `backend/controllers/riskController.js:49-111`

### 4.5 Two-stage training — the human-in-the-loop story

| Stage | Training labels | Purpose |
|---|---|---|
| **Stage 1** | Formula-derived `RiskScore.risk_class` | Cold start — works with zero HR input |
| **Stage 2** | HR-corrected labels from `hrdecisions` collection, with formula fallback where HR hasn't reviewed | Learns from accumulated human judgment |

Other design choices worth knowing:

- **Temporal split** — months 1-4 train, month 5 validate, month 6 test. Random split would leak an employee's future months into training because within-employee behavior is autocorrelated.
- **SMOTE** — oversamples minority classes (High, Critical) with `k_neighbors` auto-clipped to `min_class_size − 1` so it never exceeds the smallest class.

**The headline result** (from `ml-service/evaluation_output/evaluation_results.json`):

| Metric | Stage 1 | Stage 2 | Δ |
|---|---|---|---|
| Test accuracy | 0.80 | **0.95** | +0.15 |
| Macro F1 | 0.586 | **0.945** | **+0.36** |

**A +36 F1-point lift is the number that sells the HR feedback loop.** It means the model went from a mediocre classifier (F1 ~0.59 is barely better than majority-class) to one that's genuinely reliable (F1 ~0.95).

**Bonus insight — SHAP drift between stages** (also from the evaluation artifact):

| Feature | Stage 1 rank | Stage 2 rank | Interpretation |
|---|---|---|---|
| social_score | 1 | 1 | HR agreed the social signal is #1 |
| late_rate | 5 | 2 | HR reweighted lateness up |
| tenure_months | 4 | 3 | HR reweighted tenure up |
| productivity_index | 3 | 7 | HR **demoted** this — raw productivity is noisy |
| absence_rate | 2 | 4 | HR demoted absence slightly |

Translation: HR's corrections *changed what the model pays attention to* — and the new ranking is more defensible. That's what "learning from human judgment" actually looks like in the data.

Source: `ml-service/model.py:95-243`

### 4.6 SHAP explainability

Every prediction returns:
- `shap_base_value` — the model's average prediction before features
- `shap_values` — how much each feature pushed *this* employee above or below the base

The backend turns the top 3 absolute contributors into prose (`top_drivers`) so the UI can say:

> **Why this employee is flagged**
> - `social_score` +0.094 (rising digital disengagement)
> - `absence_rate` +0.041 (above-average absences)
> - `productivity_index` −0.062 (stable output; pulls score down)

In the UI this is rendered as red bars (push toward risk) and teal bars (push away).

Source: `ml-service/model.py:245-309`, `frontend/src/pages/RiskScoring.jsx:456-496`

---

## 5. Frontend Tour

Screen by screen, what the client will actually see:

- **Login** — quick-fill demo buttons. Use `malini@nexus.lk / nexus123` (HR manager) for the demo.
- **Dashboard** — 6 KPI cards, 6-month attendance trend, risk-distribution pie, payroll bars, top-5 high-risk list. Single call: `GET /api/dashboard/summary`.
- **Employees** — searchable directory with department pills.
- **Attendance** — monthly summary table per employee.
- **Payroll** — monthly salary breakdown with gross, EPF, ETF, late penalty, final all visible.
- **Inventory** — stock list with reorder badges + "Add Transaction" modal (addition or shipment).
- **Risk Scoring** *(the climax)*:
  - Workforce Risk Level banner at top with a stacked distribution bar.
  - Filter pills (department, risk class).
  - Table: score bar (0–100), risk badge, ML-vs-Formula channel tag, top driver, action buttons (Eye, Check, X).
  - Eye → **DetailModal**: SHAP feature-contribution bar chart, top drivers with prose explanations, Accept / Reject-&-Correct form.
  - HR-only: **Retrain Model** button → `POST /api/ml/retrain` with `stage: "stage_2"`.

Sources: `frontend/src/pages/*.jsx`

---

## 6. Recommended Demo Script (5–7 minutes)

1. **Login** as HR manager (`malini@nexus.lk`). "This is a single-tenant HR system. Four roles, JWT auth."
2. **Dashboard**. "Here's the month at a glance. Note the Workforce Risk Level — that's the metric the CHRO watches. Anything above 20% means we have a retention problem."
3. **Attendance → Payroll**. "Numbers flow automatically from attendance into compensation. No manual calculation, no spreadsheet reconciliation."
4. **Inventory**. Click "Add Transaction" and do a shipment that crosses the reorder threshold. "Email alert fires automatically to admins."
5. **Risk Scoring** — *slow down here*:
   - Point to the WRL banner. *"This percentage is the number that matters."*
   - Click a Critical employee's Eye icon.
   - Walk through the SHAP bars: *"Red bars push toward leaving, teal bars away. The model is transparent — no black box."*
   - Click **Accept** on one row. "HR confirms."
   - Click **X** on another, pick a corrected class, click Submit. "HR overrides. This is now training data."
   - Click **Retrain Model**. "The system learns from the corrections. F1 macro went from 0.59 to 0.95 between stages in our test set."
6. **Close**: "If the ML service goes down tonight, the formula still runs and the dashboard stays green. No hard dependency."

---

## 7. Q&A Cheat Sheet

**"Is the social data real?"**
No — it's VAR-simulated for the demo. The schema already has a `social_data_source` field set to `'synthetic'`; flipping a LinkedIn API integration in later requires **zero schema migration**.

**"What if the AI gets it wrong?"**
HR always has the final say. Every Accept/Reject/Correct is stored in `hrdecisions` with `decided_by`, `decided_at`, and optional `reason`. Full audit trail.

**"What happens if the ML service goes down?"**
The backend pings `/health` first with a 3-second timeout. If unreachable, it uses the deterministic formula and tags the record `formula_only`. Users see no outage.

**"How do you prevent the model from becoming biased?"**
Leave-one-out `department_risk` prevents one flagged peer from poisoning their own score. Class-balanced training + SMOTE oversample minority classes (High, Critical) so we don't just predict the majority. HR corrections provide human oversight.

**"Why Random Forest and not a neural network?"**
120 employee-month samples is far too few for deep learning. RF excels at small tabular data and — importantly — `TreeExplainer` gives *exact* SHAP values (not approximations). That's what makes the explainability trustworthy.

**"Compliance / audit trail?"**
Every HR decision stored with user + timestamp + reason. Every risk score keeps `ml_status`, model `trained_at`, and stage inside the record. You can reconstruct *which model version made which prediction on which day*.

**"Why LKR 50/min late penalty?"**
Tunable. Aggressive in the demo dataset so lateness is a visible training signal. In production, set via config.

**"Is the seed data realistic?"**
20 employees × 6 months = 120 employee-months. Attendance patterns conditioned on a hidden `risk_bias` per employee (0.01–0.45); social sub-scores VAR-persisted with α=0.65. Demo-grade, not production-grade sample size — but the architecture scales.

---

## Appendix — Key Source Files

- Payroll formula: `backend/utils/payrollCalculator.js:33-57`
- Risk formula + class thresholds: `backend/utils/riskScoring.js:20-55`
- ML client (health / predict / train): `backend/utils/mlClient.js:1-51`
- Risk controller (dual-pipeline): `backend/controllers/riskController.js:49-141`
- HR decision loop: `backend/controllers/decisionController.js:14-47`
- Dashboard aggregation: `backend/controllers/dashboardController.js:21-157`
- Feature engineering: `backend/seeds/05_seedFeatureVectors.js:25-278`
- VAR social model: `backend/seeds/04_seedSocialScores.js`, `backend/seeds/utils/helpers.js:20-60`
- Flask endpoints: `ml-service/app.py:28-94`
- Model training: `ml-service/model.py:95-243`
- SHAP extraction: `ml-service/model.py:245-309`
- Feature order (load-bearing): `ml-service/config.py:12-26`
- Frontend routing + auth: `frontend/src/App.jsx`, `frontend/src/context/AuthContext.jsx`
- Risk UI with SHAP rendering: `frontend/src/pages/RiskScoring.jsx:1-576`
- Live evaluation artifacts: `ml-service/evaluation_output/evaluation_results.json` (+ 11 PNGs)
