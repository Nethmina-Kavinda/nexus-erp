# Screenshots — Thesis Chapter 4

This folder holds UI screenshots used in **thesis Chapter 4 (Design &
Implementation)**. Captures are taken manually from a running system.

## How to capture

1. Start the full stack (see root `README.md` quick start):
   - MongoDB
   - `backend` → `npm run dev`  (http://localhost:5001)
   - `ml-service` → `python app.py`  (http://127.0.0.1:5000)
   - `frontend` → `npm run dev`  (http://localhost:3000)
2. Make sure both training stages have run (see `ml-service/README.md`).
3. Log in with `kavinda@nexus.lk / nexus123` (admin) — the admin role
   exposes every screen.
4. Capture each screenshot at **1440 × 900** or larger so the dark theme
   reads cleanly when shrunk for print.
5. Save PNGs into this folder using the filenames in the checklist below.

## Checklist

| # | Filename | Page / Action | Why (thesis Ch. 4) |
|---|---|---|---|
| 1 | `01_login.png` | Login page with demo creds visible | Auth UX |
| 2 | `02_dashboard.png` | Dashboard — all 6 KPI cards + charts visible | System overview |
| 3 | `03_employees_list.png` | Employees page with one filter (e.g. department) applied | CRUD module example |
| 4 | `04_attendance_summary.png` | Attendance page — one employee selected, monthly summary visible | Operational module |
| 5 | `05_payroll_table.png` | Payroll page — table showing gross / EPF / ETF / penalty / final | Payroll formula in action |
| 6 | `06_inventory_alerts.png` | Inventory page with at least one reorder-alert row visible | Reorder logic |
| 7 | `07_risk_scoring_table.png` | Risk Scoring page — WRL banner + filterable risk table | Core research UI |
| 8 | `08_shap_modal.png` | Risk Scoring → SHAP detail modal open for one employee | **XAI contribution** — most important shot |
| 9 | `09_hr_decision.png` | Risk Scoring → accept/reject action with toast confirmation | HITL feedback loop |
| 10 | `10_sidebar_collapsed.png` | Any page with sidebar collapsed (responsive proof) | UI polish |

Filenames are prefixed `01_` … `10_` so they sort predictably for thesis
insertion. Replace files in place — do not rename.
