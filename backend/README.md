# NEXUS ERP — Backend

Node.js + Express + MongoDB API server for the NEXUS ERP research prototype.
Owns all business logic, data persistence, RBAC, and the synchronous
integration with the Flask ML microservice.

> Companion documents:
> - Root [README.md](../README.md) — full system overview and quick-start.
> - [`../ml-service/README.md`](../ml-service/README.md) — ML microservice docs.
> - [`../docs/PROJECT_STATUS.md`](../docs/PROJECT_STATUS.md) — phase status.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 18+ | CommonJS |
| HTTP | Express 5 | `helmet`, `cors`, `morgan` middleware |
| Database | MongoDB 8 (`nexus_erp`) | Mongoose 9 ODM |
| Auth | JWT + bcrypt | role embedded in token (no DB lookup per request) |
| Email | Nodemailer (Gmail SMTP) | OTP + inventory alerts |
| HTTP client | axios | wraps Flask ML service |

---

## Project Layout

```
backend/
├── config/db.js              MongoDB connection
├── middleware/
│   ├── auth.js               protect() + authorize(...roles)
│   └── errorHandler.js       Mongoose validation, duplicate-key, cast errors
├── models/                   9 Mongoose schemas
├── controllers/              8 modules — pure request → response
├── routes/                   8 routers — wire URLs to middleware + controllers
├── seeds/                    8-step seed pipeline + helpers + runner
├── utils/                    payroll, risk scoring, ML client, SHAP→text, email
├── server.js                 entry point — mounts routes, starts listener
└── package.json
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB 8 running on `mongodb://localhost:27017`
- (Optional) Gmail account + App Password for OTP emails (`SKIP_OTP=true`
  in dev to bypass)

### Install

```bash
cd backend
npm install
```

### Environment variables

Copy `../.env.example` to `backend/.env` and fill in the blanks. The full
variable list is documented in the example file; the highlights:

| Variable | Purpose |
|---|---|
| `PORT` | API listener (default `5001`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing key for auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `ML_SERVICE_URL` | Flask URL (default `http://127.0.0.1:5000`) |
| `OTP_EMAIL` / `OTP_EMAIL_PASSWORD` | Gmail for OTP + alerts |
| `SKIP_OTP` | `true` in dev to bypass OTP step |

### Run

```bash
npm run seed   # populate MongoDB with demo data (idempotent, <1s)
npm run dev    # nodemon on PORT
```

---

## Seed Pipeline

The seed pipeline produces a complete, internally-consistent demo dataset
(100 employees × 6 months) in a single `npm run seed`. Steps run in the order
below — each depends on its predecessors. Every step `deleteMany`s its own
collection first, so re-running resets to a known state.

| Step | Script | What It Generates |
|---|---|---|
| 1 | `01_seedEmployees.js` | 100 employees across 5 departments (20 each), each with hidden `risk_bias` (0.01–0.45) ground truth |
| 2 | `02_seedAttendance.js` | ~13,000 daily records; `risk_bias` modulates absence/lateness with temporal drift |
| 3 | `03_seedPayroll.js` | 600 payroll records computed from attendance via `payrollCalculator` |
| 4 | `04_seedSocialScores.js` | VAR model: `scores_t = α × scores_(t-1) + (1-α) × MVN(μ + bias, Σ)`, Cholesky MVN sampler |
| 5 | `05_seedFeatureVectors.js` | 600 8-feature vectors, sliding-window blend, leave-one-out `department_risk`, min-max normalised |
| 6 | `06_seedRiskScores.js` | Weighted-formula scoring → Low/Medium/High/Critical tiers (Stage-1 ML labels) |
| 7 | `07_seedHRDecisions.js` | ~12% informed corrections on borderline cases (Stage-2 ML labels) |
| 8 | `08_seedInventory.js` | 15 items (raw + finished) + 63 transactions; some near reorder level |

Source of truth for each step's intent is the file header — start there if
you need to modify the dataset.

---

## API Endpoints

All routes under `/api`. Every route except auth-public requires a valid
JWT in `Authorization: Bearer <token>`.

### Auth (`/api/auth`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Create account, return JWT |
| POST | `/login` | Public | Email + password → JWT |
| POST | `/verify-otp` | Public | Send / verify 6-digit OTP (skipped if `SKIP_OTP=true`) |
| GET | `/me` | Protected | Current user (used by frontend AuthContext rehydration) |

### Employees (`/api/employees`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Protected | List with filters (`department`, `role`, `is_active`, `search`) + pagination |
| POST | `/` | admin | Create employee (default password `nexus123`) |
| GET | `/:id` | Protected | Single employee (strips `password`, `risk_bias`) |
| PUT | `/:id` | admin, hr_manager | Update (admin role can only be set by admin) |
| DELETE | `/:id` | admin | Soft delete (`is_active = false`) |

### Attendance (`/api/attendance`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/check-in` | Protected | Record check-in; flags lateness past 09:00 |
| POST | `/check-out` | Protected | Record check-out; computes overtime past 17:00 |
| GET | `/:empId/monthly?month=YYYY-MM` | Protected | Aggregated month summary (present/absent/late/OT) |

### Payroll (`/api/payroll`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/generate` | admin, hr_manager | Auto-compute monthly payroll for every active employee (idempotent upsert) |
| GET | `/:empId?month=YYYY-MM` | Protected | List payroll records, optionally filtered to one month |

### Inventory (`/api/inventory`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Protected | List items with derived `needs_reorder` flag |
| POST | `/transaction` | admin, manager | Add or ship stock; emails admins/managers when stock falls to/below reorder level |

### Risk (`/api/risk`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/scores?month=&department=&risk_class=` | Protected | List stored RiskScore records |
| GET | `/predict/:empId?month=YYYY-MM` | Protected | Compute fresh score (formula + ML if available) and upsert |
| POST | `/retrain` | admin, hr_manager | Proxy a `stage_1`/`stage_2` retrain to Flask |
| GET | `/ml-status` | Protected | Surface Flask `/health` to the UI |

### Decisions (`/api/decisions`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | admin, hr_manager | Record HR accept/reject; rejection updates the RiskScore |
| GET | `/:empId` | Protected | Audit trail for one employee |

### Dashboard (`/api/dashboard`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/summary?month=YYYY-MM` | Protected | All KPIs in one request: headcount, attendance rate, WRL, dept risk, trends |

### Health

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Liveness probe |

---

## RBAC Matrix

Roles: `admin`, `hr_manager`, `manager`, `employee`. Tokens carry the role
so middleware authorizes without a DB hit.

| Endpoint | admin | hr_manager | manager | employee |
|---|:---:|:---:|:---:|:---:|
| GET /employees | ✓ | ✓ | ✓ | — |
| POST /employees | ✓ | — | — | — |
| PUT /employees/:id | ✓ | ✓ | — | — |
| DELETE /employees/:id | ✓ | — | — | — |
| Attendance check-in/out | ✓ | ✓ | ✓ | ✓ |
| GET /attendance/:empId/monthly | ✓ | ✓ | ✓ | ✓ |
| POST /payroll/generate | ✓ | ✓ | — | — |
| GET /payroll/:empId | ✓ | ✓ | ✓ | ✓ |
| POST /inventory/transaction | ✓ | — | ✓ | — |
| GET /risk/scores | ✓ | ✓ | ✓ | — |
| GET /risk/predict/:empId | ✓ | ✓ | ✓ | — |
| POST /risk/retrain | ✓ | ✓ | — | — |
| POST /decisions | ✓ | ✓ | — | — |
| GET /dashboard/summary | ✓ | ✓ | ✓ | — |

Unauthenticated requests get 401; authenticated-but-unauthorised get 403.

---

## Error Format

All errors are JSON: `{ "success": false, "error": "<message>" }` with the
appropriate HTTP status. The central `middleware/errorHandler.js` translates
Mongoose validation failures, duplicate-key violations, and CastErrors into
4xx responses; everything else surfaces as 500.

---

## Notes

- The `risk_bias` field on Employee is `select: false` and is stripped from
  every response — it is research ground-truth and must never reach the UI.
- The OTP store is in-memory; production would need Redis.
- The Flask service is treated as best-effort: `/risk/predict` always
  produces a formula-based answer; ML augments rather than replaces it.
