# NEXUS ERP — Supervisor Meeting Brief

**Student:** Nethmina Kavinda Bandara
**Programme:** BSc (Hons) Computer Science — NSBM Green University
**Project Title:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals
**Methodology:** Design Science Research (Peffers' DSRM)
**Date:** 2 April 2026

---

## 1. Project Overview (What You're Building)

NEXUS ERP is a web-based Enterprise Resource Planning system for SMEs that integrates:

- **HR / Employee Management** — employee profiles, roles, CRUD operations
- **Attendance + Automated Payroll** — salary computation from check-in/out data (EPF/ETF, overtime, late penalties)
- **Inventory Management** — dual-tier stock tracking with automated reorder alerts
- **ML-Powered Employee Risk Scoring Engine** — the core research contribution

**Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Python Flask ML Microservice

---

## 2. Current Progress

| Item | Status |
|---|---|
| Research proposal | Completed and submitted |
| Source of Truth document (full project spec) | Completed |
| Project plan with day-by-day schedule | Completed |
| Technology stack finalised | Completed |
| Research objectives and questions defined | Completed (8 secondary objectives, 7 research questions) |
| Database schema design (9 collections) | Designed and documented |
| API endpoint architecture (~18 REST endpoints + 3 ML endpoints) | Designed and documented |
| System architecture and data flow | Fully designed |
| SLR paper search | Started — identifying 20-25 papers across 5 themes |

---

## 3. What's Being Done Right Now (Phase 1: SLR)

The **Systematic Literature Review** is in active progress, targeting submission by **10 April 2026**.

**SLR covers 5 thematic areas:**

1. ERP systems for SMEs (MERN/web-based) — 3-4 papers
2. Employee attrition prediction using ML (Random Forest, ensembles) — 8-10 papers
3. Social media signals in HR analytics — 3-4 papers
4. Synthetic data generation (Gaussian modelling) — 2-3 papers
5. Explainable AI + Human-in-the-Loop ML — 2-3 papers

**Target:** 20-25 peer-reviewed papers from IEEE Xplore, Google Scholar, and ResearchGate.

**SLR Timeline:**

| Date | Task |
|---|---|
| Apr 1-3 | Paper search and summarisation |
| Apr 4-6 | Draft SLR — introduction, search strategy, thematic review (5 themes) |
| Apr 7-8 | Comparison table, gap analysis, research gap justification |
| Apr 9-10 | Review, formatting (IEEE style), final proofread and submission |

---

## 4. Research Contribution (Key Talking Points for Supervisor)

### The Research Gap

Existing systems fall into three silos:
1. **ERP only** (SAP, Oddo) — no ML-based employee risk scoring
2. **ML attrition prediction only** — standalone models, not integrated into ERP
3. **Enterprise HR analytics** — expensive, not tailored for SMEs

**No lightweight ERP system currently combines payroll automation, a formally documented synthetic social behaviour signal, and ML-powered employee risk scoring with a human-in-the-loop feedback mechanism.**

### Three Pillars of Novelty

**Pillar 1: Synthetic Social Score as API Proxy**
- Composite signal (0.0-1.0) using Gaussian sub-score modelling (Box-Muller transform)
- 4 sub-scores: job search activity (0.35), post frequency drop (0.25), network growth (0.20), sentiment (0.20)
- Formally documented as a placeholder for LinkedIn/Facebook API data
- Schema designed for zero-migration transition to live data

**Pillar 2: Integrated Risk Scoring in Lightweight ERP**
- 8-feature vector from cross-module ERP data (attendance + payroll + social)
- Dual scoring: weighted composite formula (Node.js) + Random Forest classifier (Python Flask)
- Risk tiers: Low / Medium / High / Critical

**Pillar 3: Human-in-the-Loop ML Retraining**
- HR managers accept/reject ML predictions
- Accumulated decisions become ground truth for model retraining
- Bridges gap between automated prediction and responsible HR decision-making

---

## 5. Methodology

**Design Science Research (Peffers' DSRM)** — chosen because the primary outcome is an IT artefact that solves a real-world problem.

| DSRM Stage | Application |
|---|---|
| Problem Identification | SMEs lack integrated ERP with predictive workforce analytics |
| Objectives | Build NEXUS ERP with automated payroll, inventory, and ML risk scoring |
| Design & Development | MERN stack + Flask ML microservice |
| Demonstration | System walkthrough with role-based use cases |
| Evaluation | Functional testing + ML evaluation (accuracy, SHAP, confusion matrix) |
| Communication | Thesis document |

---

## 6. Full Project Timeline

| Phase | Dates | Deliverable |
|---|---|---|
| **Phase 1: SLR + Research Foundation** | Apr 1-10 | SLR document ready for submission |
| **Phase 2: Backend Development** | Apr 11-20 | Full backend API with seed data |
| **Phase 3: ML Microservice** | Apr 21-25 | ML pipeline — predict, train, retrain, explain |
| **Phase 4: Frontend Development** | Apr 26 - May 2 | Full frontend with dashboard and risk UI |
| **Phase 5: Evaluation + ML Analysis** | May 3-5 | All evaluation metrics and charts |
| **Phase 6: Thesis Writing** | May 5-10 | Complete thesis (Chapters 1-6) |
| **Phase 7: Testing + Polish** | May 11-12 | Fully tested codebase + documentation |
| **Phase 8: Delivery** | May 13-16 | Final handover + mentorship sessions |

---

## 7. Evaluation Strategy (What to Tell Supervisor)

### ML Evaluation (70% of evaluation chapter):
- Classification accuracy, confusion matrix
- Precision / Recall / F1 per risk class
- Feature importance analysis
- SHAP explainability plots
- Before/after retraining comparison

### Social Score Validation:
- Gaussian distribution verification (histograms, Q-Q plots)
- Mean/std dev checks against configured parameters
- Temporal drift analysis for at-risk employees

### Functional Testing:
- Payroll accuracy verification
- Inventory alert response time
- API performance testing
- Security testing (JWT, OTP, RBAC)

---

## 8. Thesis Chapter Structure

| Chapter | Title | Weight |
|---|---|---|
| 1 | Introduction | 10% |
| 2 | Literature Review (SLR) | 15% |
| 3 | Methodology (DSR) | 10% |
| 4 | Design & Implementation | 25% |
| 5 | Evaluation & Results | 30% |
| 6 | Conclusion & Future Work | 10% |

**Key point:** Chapters 4 and 5 carry 55% of the thesis weight, with heavy focus on the ML risk scoring engine, social score model, and SHAP-based evaluation.

---

## 9. Questions to Ask Supervisor

Consider asking the supervisor these questions to get useful guidance:

1. "Are you satisfied with the SLR thematic structure covering 5 areas? Should I add or merge any themes?"
2. "For the evaluation chapter, is the planned ML metrics set (confusion matrix, SHAP, F1, retraining comparison) sufficient?"
3. "Do you have any concerns about using synthetic data with Gaussian modelling instead of a real dataset?"
4. "Should I prioritise any particular chapter or section for early draft review?"
5. "What formatting standard should I follow — IEEE or university-specific template?"
6. "Are there any additional papers or references you'd recommend for the literature review?"

---

## 10. Key Points to Communicate Confidently

- The project is **well-planned** with a detailed day-by-day schedule
- The research gap is **clearly identified** — no existing system combines all three novelty pillars
- The methodology (DSR) is **appropriate** for building and evaluating an IT artefact
- The SLR is **actively in progress** and on track for April 10 submission
- All data is **synthetic by design** — formally modelled, statistically validated, with a documented production pathway
- The ML component uses **SHAP for explainability** — aligning with responsible AI practices
- The system includes a **human-in-the-loop feedback mechanism** — no automated adverse HR actions

---

*Prepared for supervisor meeting on 2 April 2026.*
