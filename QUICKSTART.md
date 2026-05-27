# NEXUS ERP — Quick Start Guide

Follow every step in order. Each section ends with a health check so you know the step succeeded before moving on.

---

## Step 1 — Prerequisites Check

Open a terminal and run each command. If any command is not found, install the tool before continuing.

### Node.js 18 or newer
```bash
node --version
```
Expected: `v18.x.x` or higher.
Download: https://nodejs.org (LTS version)

### npm (bundled with Node.js)
```bash
npm --version
```
Expected: `9.x.x` or higher.

### Python 3.10 or newer
```bash
python --version
```
Expected: `Python 3.10.x` or higher.
Download: https://www.python.org/downloads/

### MongoDB 6 or newer
```bash
mongod --version
```
Expected: `db version v6.x.x` or higher.
Download: https://www.mongodb.com/try/download/community

### MongoDB data directory
MongoDB needs a directory to store data. Create it if it does not exist:
```bash
# Windows
mkdir C:\data\db
```

**Checklist — all four must pass before proceeding:**
- [ ] `node --version` returns v18+
- [ ] `python --version` returns 3.10+
- [ ] `mongod --version` returns v6+
- [ ] `C:\data\db` directory exists

---

## Step 2 — Install Dependencies

From the project root (`system/`), run the setup script. It installs all Node and Python packages and creates the backend environment file.

```bat
setup.bat
```

Wait for it to finish. You should see:

```
[1/4] Installing backend dependencies...   Done.
[2/4] Installing frontend dependencies...  Done.
[3/4] Setting up ML service (Python venv + pip install)...  Done.
[4/4] Checking environment file...  backend\.env created from .env.example
```

> **If setup.bat fails** or you are on macOS/Linux, run the steps manually:
> ```bash
> cd backend  && npm install && cd ..
> cd frontend && npm install && cd ..
> cd ml-service
> python -m venv venv
> venv\Scripts\activate      # Windows
> # source venv/bin/activate  # macOS/Linux
> pip install -r requirements.txt
> cd ..
> ```

**Checklist:**
- [ ] `backend/node_modules/` exists
- [ ] `frontend/node_modules/` exists
- [ ] `ml-service/venv/` exists
- [ ] `backend/.env` exists

---

## Step 3 — Configure Environment

Open `backend/.env` in any text editor. The defaults work for a local setup — you only need to change values if your MongoDB is on a different port or you want real email alerts.

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/nexus_erp
JWT_SECRET=nexus_erp_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://127.0.0.1:5000
OTP_EMAIL=your_gmail@gmail.com          ← only needed for real OTP emails
OTP_EMAIL_PASSWORD=your_app_password    ← only needed for real OTP emails
SKIP_OTP=true                           ← keep true in development
NODE_ENV=development
```

**Checklist:**
- [ ] `MONGO_URI` points to your MongoDB instance
- [ ] `SKIP_OTP=true` (leave this unless you have configured Gmail)

---

## Step 4 — Start MongoDB

Open **Terminal 1** and run:

```bash
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db
```

> On older MongoDB installs the path may be `Server\6.0` or `Server\7.0`. Adjust accordingly.
> On macOS/Linux: `mongod --dbpath /data/db`

### Health check
Leave Terminal 1 running. In a new terminal, verify MongoDB accepted the connection:

```bash
mongosh --eval "db.adminCommand('ping')" --quiet
```

Expected output:
```
{ ok: 1 }
```

**Checklist:**
- [ ] Terminal 1 shows `Waiting for connections on port 27017`
- [ ] `mongosh ping` returns `{ ok: 1 }`

---

## Step 5 — Seed the Database

Open **Terminal 2**. Navigate to the backend and run the seed pipeline:

```bash
cd backend
npm run seed
```

This populates all collections with 100 employees × 6 months of synthetic data. It takes about 3 seconds.

### Expected output
```
========================================
 NEXUS ERP — Database Seeding Pipeline
========================================
MongoDB Connected: localhost
[1/8] Step 1: Employees
  Seeded 100 employees
  Dept distribution: Engineering=20 Marketing=20 Finance=20 Operations=20 HR=20
  Risk bias: Low=40 Med=35 High=18 Crit=7
...
 All seeds completed in ~3s
========================================
```

**Checklist:**
- [ ] Output shows `Seeded 100 employees`
- [ ] Output shows `All seeds completed`
- [ ] No `ERROR` lines in the output

---

## Step 6 — Start the Backend

In **Terminal 2** (same backend folder), start the API server:

```bash
npm run dev
```

### Expected output
```
NEXUS ERP Backend running on port 5001
ML Service URL: http://127.0.0.1:5000
MongoDB Connected: localhost
```

### Health check
In a new terminal:

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{ "status": "ok", "service": "nexus-erp-backend", "timestamp": "..." }
```

**Checklist:**
- [ ] Terminal 2 shows `running on port 5001`
- [ ] `curl /api/health` returns `"status": "ok"`

---

## Step 7 — Start the ML Service

Open **Terminal 3**. Navigate to the ml-service folder, activate the virtual environment, and start Flask:

```bash
cd ml-service
venv\Scripts\activate
python app.py
```

> macOS/Linux: `source venv/bin/activate`

### Expected output
```
Model loaded: stage=stage_2, ...
 * Running on http://127.0.0.1:5000
```

> If you see `No model found — /predict will return 503 until /train is called`, that is fine. The model trains in the next step.

### Health check

```bash
curl http://127.0.0.1:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_stage": "stage_2",
  "accuracy": 0.83,
  "flask_version": "1.0.0"
}
```

> If `model_loaded` is `false`, the model has not been trained yet. Proceed to Step 8.

**Checklist:**
- [ ] Terminal 3 shows `Running on http://127.0.0.1:5000`
- [ ] `curl /health` returns `"status": "ok"`

---

## Step 8 — Train the ML Model

Run both training stages in order. Each takes 5–15 seconds depending on your machine.

**Stage 1** — trains on formula-derived labels (cold-start baseline):
```bash
curl -X POST http://127.0.0.1:5000/train \
  -H "Content-Type: application/json" \
  -d "{\"stage\":\"stage_1\"}"
```

Expected response:
```json
{
  "success": true,
  "stage": "stage_1",
  "accuracy_test": 0.88,
  "accuracy_validation": 0.93,
  "samples_used": 720
}
```

**Stage 2** — retrains on HR-corrected labels (human-in-the-loop improvement):
```bash
curl -X POST http://127.0.0.1:5000/train \
  -H "Content-Type: application/json" \
  -d "{\"stage\":\"stage_2\"}"
```

Expected response:
```json
{
  "success": true,
  "stage": "stage_2",
  "accuracy_test": 0.83,
  "f1_macro": 0.836,
  "samples_used": 582
}
```

### Verify model is loaded after training
```bash
curl http://127.0.0.1:5000/health
```
Confirm `"model_loaded": true` and `"model_stage": "stage_2"`.

**Checklist:**
- [ ] Stage 1 training returns `"success": true`
- [ ] Stage 2 training returns `"success": true`
- [ ] `/health` shows `"model_stage": "stage_2"`

> **Note:** You only need to train the model once. On subsequent restarts it loads automatically from `model.pkl`.

---

## Step 9 — Start the Frontend

Open **Terminal 4**. Navigate to the frontend folder:

```bash
cd frontend
npm run dev
```

### Expected output
```
  VITE v6.x.x  ready in 636ms

  ➜  Local:   http://localhost:3000/
```

**Checklist:**
- [ ] Terminal 4 shows `Local: http://localhost:3000/`

---

## Step 10 — Final System Check

All four services should now be running. Verify:

| Service | Terminal | URL | Expected |
|---|---|---|---|
| MongoDB | 1 | port 27017 | `Waiting for connections` |
| Backend | 2 | http://localhost:5001 | `running on port 5001` |
| ML Service | 3 | http://127.0.0.1:5000 | `Running on http://127.0.0.1:5000` |
| Frontend | 4 | http://localhost:3000 | `Local: http://localhost:3000/` |

Run a quick end-to-end check — this logs in and fetches the dashboard in one step:

```bash
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"kavinda@nexus.lk\",\"password\":\"nexus123\"}" \
  | grep -o '"success":true'
```

Expected: `"success":true`

**Checklist:**
- [ ] All 4 terminals are running without errors
- [ ] Login curl returns `"success":true`

---

## Step 11 — Open the Application

Open your browser and go to:

```
http://localhost:3000
```

You will see the NEXUS ERP login screen.

---

## Demo Credentials

| Role | Email | Password | What You Can See |
|---|---|---|---|
| **Admin** | `kavinda@nexus.lk` | `nexus123` | Everything — all modules, user management, full dashboard |
| **HR Manager** | `malini@nexus.lk` | `nexus123` | HR, Risk Scoring (accept/reject), Payroll, Dashboard |

> All 100 seeded employees share the password `nexus123` and can log in with their `firstname@nexus.lk` or `firstname.lastname@nexus.lk` email.

### What to explore first

1. **Dashboard** — WRL gauge, risk distribution chart, department breakdown, KPI cards
2. **Risk Scoring** — Filter by department, open any employee's SHAP modal to see which features drive their risk score, use the Accept / Reject buttons
3. **Payroll** — Generate monthly payroll and see gross/EPF/ETF/penalty breakdown
4. **Inventory** — Add a stock transaction to trigger a reorder alert

---

## Stopping the System

Close each terminal (Ctrl+C) in reverse order: frontend → ML service → backend → MongoDB.

To restart later: MongoDB and backend must always start before the frontend. The ML service and model training only need to run once — `model.pkl` persists between restarts.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `Cannot connect to MongoDB` | mongod not running | Start Terminal 1 first |
| `ECONNREFUSED 5001` on frontend | Backend not running | Start Terminal 2 |
| `ML prediction unavailable` | Flask down or model not trained | Start Terminal 3, run both `/train` calls |
| `Invalid credentials` on login | Seeds not run | Run `npm run seed` in backend/ |
| `node_modules not found` | Setup not run | Run `setup.bat` or `npm install` manually |
| `No module named flask` | Python venv not activated | Run `venv\Scripts\activate` before `python app.py` |
