# NEXUS ERP — Frontend

React 18 + Vite single-page application for the NEXUS ERP research prototype. Dark navy theme. Communicates with the Express backend on `:5001` via a Vite dev-proxy.

> Companion documents:
> - Root [README.md](../README.md) — full system overview and quick-start.
> - [`../backend/README.md`](../backend/README.md) — API server docs.
> - [`../ml-service/README.md`](../ml-service/README.md) — ML microservice docs.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS (custom NEXUS dark palette) |
| HTTP | axios (JWT interceptor in `AuthContext`) |
| Icons | lucide-react |
| Charts | Recharts |

---

## Project Layout

```
frontend/src/
├── pages/
│   ├── Login.jsx              Dark-themed login with demo credential hints
│   ├── Dashboard.jsx          KPI cards, attendance area chart, risk donut, payroll bars
│   ├── Employees.jsx          Searchable table with department / role filters
│   ├── Attendance.jsx         Monthly summary per employee (present/absent/late/OT)
│   ├── Payroll.jsx            Monthly table (gross, EPF+ETF, penalty, final salary)
│   ├── Inventory.jsx          Stock list with reorder alerts, add transaction modal
│   └── RiskScoring.jsx        WRL banner, risk table, SHAP detail modal, HR accept/reject
├── components/
│   ├── Layout.jsx             Sidebar + Topbar wrapper
│   ├── Sidebar.jsx            Collapsible nav with ML status badge and user strip
│   ├── Topbar.jsx             Page title, notification bell, user avatar
│   ├── KPICard.jsx            Icon + count-up animation + trend arrow
│   ├── RiskBadge.jsx          4-colour pill (Critical pulses)
│   ├── Toast.jsx              Stacked notification system (success/error/warning/info)
│   ├── Panel.jsx              Shared card wrapper
│   └── ErrorBanner.jsx        Inline error state
├── context/
│   └── AuthContext.jsx        JWT storage, role helpers, axios interceptor
├── hooks/
│   └── useFetch.js            Generic data fetching (loading / error / refetch)
├── services/
│   └── api.js                 Typed service objects for all 8 backend modules
├── App.jsx                    Router — protected routes by role
├── main.jsx                   Entry point
└── index.css                  Tailwind directives + custom NEXUS theme variables
```

---

## Setup

```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

The Vite dev server proxies `/api/*` to `http://localhost:5001` (configured in `vite.config.js`). The backend must be running before opening the app.

### Build for production

```bash
npm run build      # outputs to frontend/dist/
```

---

## Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | kavinda@nexus.lk | nexus123 | All modules |
| HR Manager | malini@nexus.lk | nexus123 | HR, Risk, Payroll, Dashboard |

---

## Key Pages

### Dashboard
6 KPI cards (headcount, WRL, attendance rate, late arrivals, payroll total, inventory alerts), attendance area chart, risk distribution donut, payroll bar chart, and the top-5 highest-risk employees table.

### Risk Scoring
Workforce Risk Level (WRL) banner that turns amber when WRL ≥ 30%. Filterable risk table with SHAP detail modal per employee, showing all 8 feature contributions as a horizontal bar chart. HR accept/reject buttons feed the Stage 2 retraining loop. Admin/HR can trigger model retraining from the page.

### Employees
Full CRUD table with department and role filters. Avatar initials, risk badge column, and an inline drawer for editing. Admin-only create/delete.

---

## Notes

- OTP verification is bypassed in development (`SKIP_OTP=true` in backend `.env`).
- The frontend hardcodes `month=2026-03` for dashboard and risk views so it always displays the most data-rich seed month.
- `AuthContext` stores the JWT in `localStorage`; the axios interceptor attaches it to every request and redirects to `/login` on 401.
