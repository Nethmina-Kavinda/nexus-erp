# NEXUS ERP — Full Project Plan

## Context

Nethmina's project (Package D — LKR 80,000) needs to be delivered in 5-6 weeks from March 31, 2026. The project includes research/thesis writing, full MERN-stack ERP development, Python ML microservice, and 4 mentorship sessions post-delivery.

**Constraints:**
- 4-5 hours/day available (part-time — 1-2 other client projects running)
- SLR deadline: April 10 (9 days from now — URGENT)
- Second payment (20k): April 14
- Total available work hours: ~4.5 hrs × 35 days = ~157 hours
- Must balance research writing and development
- Mentorship sessions are post-delivery

---

## Phase 1: SLR + Research Foundation (Apr 1–10) — ~10 days, ~45 hrs

**Priority: CRITICAL — SLR submission April 10**

### Week 1 (Apr 1–6): SLR Writing

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 1 (Tue) | Paper search — find 20-25 papers across 5 SLR themes using Google Scholar, IEEE Xplore, ResearchGate | 4.5 | Paper list with titles, authors, year, relevance notes |
| Apr 2 (Wed) | Read and summarise 8-10 core papers (ML attrition, Random Forest, social signals) | 4.5 | Summary notes per paper |
| Apr 3 (Thu) | Read remaining papers (ERP, synthetic data, explainable AI, security) | 4.5 | All papers summarised |
| Apr 4 (Fri) | Draft SLR — Introduction, search strategy, inclusion/exclusion criteria | 4.5 | SLR sections 1-2 drafted |
| Apr 5 (Sat) | Draft SLR — Thematic review (Theme 1: ERP systems, Theme 2: ML attrition prediction) | 4.5 | Themes 1-2 written |
| Apr 6 (Sun) | Draft SLR — Thematic review (Theme 3: Social signals, Theme 4: Synthetic data, Theme 5: XAI/HITL) | 4.5 | Themes 3-5 written |

### Week 1 cont. (Apr 7–10): SLR Completion

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 7 (Mon) | Comparison table (all papers mapped to RQs), gap analysis section | 4.5 | Comparison table + gap identification |
| Apr 8 (Tue) | Write research gap justification, link to NEXUS ERP novelty | 4.5 | Gap analysis complete |
| Apr 9 (Wed) | Full SLR review, formatting (IEEE), reference check, polish | 4.5 | SLR draft complete |
| Apr 10 (Thu) | Final proofread, format submission document, deliver to client | 3 | **SLR SUBMITTED** |

**Deliverable: SLR document ready for submission**

---

## Phase 2: Backend Development (Apr 11–20) — ~10 days, ~45 hrs

**Priority: HIGH — Build the data infrastructure that the ML model needs**

### Strategy
Build backend first because:
1. ML model needs attendance/payroll/social data to train on
2. Seeding scripts populate the database
3. Frontend can be built against working APIs later

### Week 2-3 (Apr 11–15): Core Backend

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 11 (Fri) | Project scaffold — Node.js + Express, MongoDB connection, folder structure, .env config | 4.5 | Backend boilerplate running |
| Apr 12 (Sat) | Mongoose schemas — all 9 collections (Employees, Attendance, Payroll, Inventory, InventoryTransactions, SocialScores, EmployeeFeatures, RiskScores, HRDecisions) | 4.5 | All schemas defined |
| Apr 13 (Sun) | Auth module — JWT login/register, bcrypt, role middleware (Admin/HR/Manager/Employee), OTP email verification | 4.5 | Auth fully working |
| Apr 14 (Mon) | Employee module — CRUD endpoints, list/filter/search + **Seeding script: 20 employees with risk_bias** | 4.5 | Employee API + seed data |
| Apr 15 (Tue) | Attendance module — check-in/out endpoints, monthly summary, **Seeding script: 6 months attendance data** | 4.5 | Attendance API + seed data |

> **Apr 14: Second payment (LKR 20,000) due from client**

### Week 3 (Apr 16–20): Payroll, Inventory, Social Score

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 16 (Wed) | Payroll module — auto-calculate from attendance (gross, net, EPF/ETF, late penalty), monthly generation endpoint | 4.5 | Payroll API working |
| Apr 17 (Thu) | Payroll seeding — generate 6 months payroll from attendance seed data | 3 | Payroll seed data |
| Apr 17 (Thu) | Inventory module — stock CRUD, transaction endpoint (add/remove), reorder alert logic | 1.5 | Inventory API started |
| Apr 18 (Fri) | Inventory completion — automated email alerts (node-cron), **inventory seed data** | 4.5 | Inventory complete |
| Apr 19 (Sat) | **Social Score seeding script** — Gaussian sub-score generation (Box-Muller), 6 months per employee, temporal drift | 4.5 | socialScoreSeed.js complete |
| Apr 20 (Sun) | **Feature vector construction** — aggregate attendance + payroll + social into 8-feature vectors per employee per month | 4.5 | EmployeeFeature documents populated |

**Deliverable: Full backend API with all seed data populated**

---

## Phase 3: ML Microservice (Apr 21–25) — ~5 days, ~22 hrs

**Priority: CRITICAL — This is the core research contribution**

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 21 (Mon) | Flask app scaffold — /predict, /train, /health endpoints, CORS config, connect to MongoDB | 4.5 | Flask microservice running |
| Apr 22 (Tue) | Random Forest model — train on feature vectors (200 trees, balanced weights), save model (joblib), /predict returns risk class + feature importance | 4.5 | RF model trained and serving predictions |
| Apr 23 (Wed) | Weighted composite scoring — implement in Node.js backend, risk tier classification (Low/Med/High/Critical), WRL calculation | 4.5 | Dual scoring path working |
| Apr 24 (Thu) | HR feedback loop — accept/reject endpoint, store in HRDecision, /retrain endpoint triggers model retrain with accumulated ground truth | 4.5 | Feedback loop complete |
| Apr 25 (Fri) | SHAP integration — SHAP explainer for feature importance per prediction, feature importance charts data endpoint | 4.5 | SHAP analysis working |

**Deliverable: Full ML pipeline — predict, train, retrain, explain**

---

## Phase 4: Frontend Development (Apr 26–May 2) — ~7 days, ~31 hrs

**Priority: MEDIUM — UI for demonstration and thesis screenshots**

### Strategy
Build functional UI — clean but not over-designed. Focus on pages that demonstrate the research contribution (dashboard, risk scoring) over standard CRUD pages.

| Day | Task | Hours | Output |
|---|---|---|---|
| Apr 26 (Sat) | React scaffold — Vite + React 18, routing, layout, auth pages (login/register), JWT token handling | 4.5 | App shell with auth |
| Apr 27 (Sun) | Employee pages — list view, employee profile, CRUD forms | 4.5 | Employee module UI |
| Apr 28 (Mon) | Attendance pages — check-in/out interface, monthly summary view | 4.5 | Attendance module UI |
| Apr 29 (Tue) | Payroll pages — payroll list, payslip view, monthly generation trigger | 4.5 | Payroll module UI |
| Apr 30 (Wed) | Inventory pages — stock list, add/remove transactions, reorder alert indicators | 4.5 | Inventory module UI |
| May 1 (Thu) | **Dashboard — KPI cards, risk distribution chart, department risk breakdown, WRL gauge, attendance rate, inventory alerts** | 4.5 | Main dashboard |
| May 2 (Fri) | **Risk scoring UI — employee risk profile, SHAP visualisation, accept/reject buttons, retrain trigger, risk history** | 4.5 | Risk scoring interface complete |

**Deliverable: Full frontend — all 5-6 pages with working dashboard and risk UI**

---

## Phase 5: Evaluation + ML Analysis (May 3–5) — ~3 days, ~13 hrs

**Priority: CRITICAL — This produces the thesis evaluation chapter data**

| Day | Task | Hours | Output |
|---|---|---|---|
| May 3 (Sat) | ML evaluation — confusion matrix, precision/recall/F1 per class, classification accuracy, cross-validation | 4.5 | ML metrics computed |
| May 4 (Sun) | SHAP analysis — SHAP summary plot, per-employee explanations, feature importance bar chart. Social score validation — histograms, Q-Q plots, mean/std verification, temporal drift plots | 4.5 | All evaluation charts/plots generated |
| May 5 (Mon) | Before/after retraining comparison — accuracy before HR feedback vs after. Functional testing — payroll accuracy, inventory alerts, API response times, security tests | 4 | Full evaluation data ready |

**Deliverable: All evaluation metrics, charts, and plots for thesis Chapter 5**

---

## Phase 6: Thesis Writing (May 5–10) — ~5 days, ~22 hrs

**Priority: HIGH — Complete thesis document**

### Strategy
SLR (Chapter 2) is already done. Methodology (Chapter 3) is straightforward. Focus writing time on Chapter 4 (Design — ML deep dive) and Chapter 5 (Evaluation).

| Day | Task | Hours | Output |
|---|---|---|---|
| May 5 (Mon) | Chapter 1 — Introduction (refine from proposal: background, motivation, objectives, scope) | 1 | Chapter 1 draft |
| May 6 (Tue) | Chapter 3 — Methodology (DSR justification, Peffers' DSRM stages, data collection, ethical considerations) | 4.5 | Chapter 3 complete |
| May 7 (Wed) | Chapter 4 — Design: ERP architecture (concise), database design, API design, system diagrams | 4.5 | Chapter 4 part 1 |
| May 8 (Thu) | Chapter 4 — Design: Social score model (deep), risk scoring pipeline (deep), ML microservice, feedback loop | 4.5 | Chapter 4 part 2 (core) |
| May 9 (Fri) | Chapter 5 — Evaluation: ML results (confusion matrix, SHAP plots, feature importance), social score validation, functional test results, retraining comparison | 4.5 | Chapter 5 complete |
| May 10 (Sat) | Chapter 6 — Conclusion (findings mapped to RQs, contributions, limitations, future work). Final assembly, formatting, IEEE references, table of contents, abstract | 4.5 | **FULL THESIS COMPLETE** |

**Deliverable: Complete thesis document (Chapters 1-6)**

---

## Phase 7: Integration Testing + Final Polish (May 11–12) — ~2 days, ~9 hrs

| Day | Task | Hours | Output |
|---|---|---|---|
| May 11 (Sun) | End-to-end testing — full workflow (register → login → attendance → payroll → risk prediction → accept/reject → retrain). Bug fixes. | 4.5 | System fully tested |
| May 12 (Mon) | Code documentation — README, setup instructions, .env.example, requirements.txt. GitHub repo setup. Final thesis proofread. | 4.5 | Everything polished |

**Deliverable: Complete codebase + thesis ready for handover**

---

## Phase 8: Delivery + Mentorship (May 13–16) — ~4 days

| Day | Task | Hours | Output |
|---|---|---|---|
| May 13 (Tue) | **FINAL DELIVERY** — hand over source code (GitHub), thesis document, all documentation | 1 | Project delivered |
| May 13 (Tue) | Mentorship Session 1 — Project overview, ERP architecture, module walkthrough | 0.5 | Session complete |
| May 14 (Wed) | Mentorship Session 2 — Risk scoring engine, feature pipeline, weighted formula, ML model | 0.5 | Session complete |
| May 15 (Thu) | Mentorship Session 3 — Backend deep dive, API routes, auth flow, database design | 0.5 | Session complete |
| May 16 (Fri) | Mentorship Session 4 — Frontend walkthrough, React components, state management, UI | 0.5 | Session complete |

> **Final payment (LKR 50,000) due on delivery — May 13**

---

## Summary Timeline

```
Week 1  (Apr 1-10)   ██████████  SLR Writing + Submission [CRITICAL]
Week 2  (Apr 11-15)  ██████████  Backend Core (Auth, Employee, Attendance)
Week 3  (Apr 16-20)  ██████████  Backend (Payroll, Inventory, Social Score, Features)
Week 4  (Apr 21-25)  ██████████  ML Microservice (RF, SHAP, Feedback Loop) [CRITICAL]
Week 5  (Apr 26-May 2) ████████  Frontend (All pages + Dashboard + Risk UI)
Week 6  (May 3-10)   ██████████  Evaluation + Thesis Writing [CRITICAL]
Week 7  (May 11-16)  ██████      Testing + Delivery + Mentorship
```

## Hour Budget

| Phase | Days | Hours | % of Total |
|---|---|---|---|
| Phase 1: SLR | 10 | 43.5 | 27% |
| Phase 2: Backend | 10 | 43.5 | 27% |
| Phase 3: ML Microservice | 5 | 22.5 | 14% |
| Phase 4: Frontend | 7 | 31.5 | 20% |
| Phase 5: Evaluation | 3 | 13 | 8% |
| Phase 6: Thesis Writing | 5 | 23.5 | — |
| Phase 7: Testing/Polish | 2 | 9 | 6% |
| Phase 8: Delivery + Mentorship | 4 | 3 | — |
| **Total** | **~46 days** | **~190 hrs** | |

> Note: At 4.5 hrs/day this is tight but achievable. Some days in Phase 6 overlap with Phase 5. Weekend days may need 5-6 hrs to stay on track.

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| SLR takes longer than expected | Start paper search immediately, use systematic approach — don't read full papers, focus on abstracts + methodology + results |
| Backend falls behind | Use boilerplate patterns — repeat the same CRUD structure across modules. Seed scripts are more important than perfect APIs |
| ML model underperforms | With synthetic data and known ground truth (risk_bias), RF should perform well. If not, tune hyperparameters or increase dataset |
| Frontend takes too long | Keep UI functional, not fancy. Use a component library (Ant Design / MUI) to speed up. Dashboard is the priority page |
| Thesis writing crunch | Chapter 2 (SLR) done early. Chapter 3 (methodology) is short. The real work is Chapter 4-5 — schedule buffer time |
| Client asks for scope changes | Agreement states scope changes require revised pricing. Stick to Package D deliverables |

## Payment Milestones

| Date | Amount | Trigger |
|---|---|---|
| Mar 31 | LKR 10,000 | Paid (advance) |
| Apr 14 | LKR 20,000 | Client salary day |
| May 13 | LKR 50,000 | Final delivery |

## Key Files to Create

```
nethmina/
├── client_info/              # Quotation, invoice, agreement (done)
├── system/
│   ├── research_docs/
│   │   ├── SOURCE_OF_TRUTH.md    # (done)
│   │   ├── SLR.md                # Systematic Literature Review
│   │   └── papers/               # Downloaded reference papers
│   ├── backend/
│   │   ├── models/               # Mongoose schemas (9 collections)
│   │   ├── routes/               # Express route handlers
│   │   ├── middleware/            # Auth, role-check middleware
│   │   ├── seeds/                # Seeding scripts (employee, attendance, payroll, social, inventory)
│   │   ├── utils/                # Payroll calculator, risk scoring, email
│   │   └── server.js
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/            # Login, Dashboard, Employees, Attendance, Payroll, Inventory, Risk
│   │   │   ├── components/       # Shared components, charts
│   │   │   └── services/         # API service layer
│   │   └── vite.config.js
│   ├── ml-service/
│   │   ├── app.py                # Flask app with /predict, /train, /health
│   │   ├── model.py              # RF training, prediction, SHAP
│   │   └── requirements.txt
│   └── thesis/
│       └── chapters/             # Chapter 1-6 drafts
```
