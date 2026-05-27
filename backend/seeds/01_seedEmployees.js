/**
 * Seed step 1/8 — Employees.
 *
 * Generates 100 employees across 5 departments (Engineering, Marketing,
 * Finance, Operations, HR) — 20 per department.
 *
 * The first 20 are named employees that include all privileged roles
 * (admin, hr_manager, manager). The remaining 80 are additional staff
 * added to bring the workforce to a realistic SME scale.
 *
 * Every employee carries a hidden `risk_bias` in [0.01, 0.45] — the
 * GROUND TRUTH attrition propensity that drives downstream realistic
 * patterns (absences, social-score drift, lateness). `risk_bias` is
 * `select: false` in the schema and stripped by every API response.
 *
 * Risk bias distribution (100 total):
 *   Low  (≤0.05): 40 employees
 *   Med  (0.06–0.15): 35 employees
 *   High (0.16–0.35): 18 employees
 *   Crit (>0.35):      7 employees
 *
 * Must run first: every later seed step depends on Employee documents.
 */
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const EMPLOYEES = [
  // ── Engineering (20 total: 5 original + 15 new) ──────────────────────────

  // Original 5
  { name: 'Nimal Perera',        email: 'nimal@nexus.lk',        role: 'employee',    department: 'Engineering', position: 'Software Developer',   hourly_rate: 1500, allowances: 15000, risk_bias: 0.42, hire_date: -30 },
  { name: 'Kasun Fernando',      email: 'kasun@nexus.lk',        role: 'employee',    department: 'Engineering', position: 'Frontend Developer',   hourly_rate: 1400, allowances: 12000, risk_bias: 0.12, hire_date: -18 },
  { name: 'Dilini Jayawardena',  email: 'dilini@nexus.lk',       role: 'manager',     department: 'Engineering', position: 'Engineering Lead',      hourly_rate: 1800, allowances: 20000, risk_bias: 0.03, hire_date: -36 },
  { name: 'Ruwan Silva',         email: 'ruwan@nexus.lk',        role: 'employee',    department: 'Engineering', position: 'Backend Developer',    hourly_rate: 1450, allowances: 13000, risk_bias: 0.28, hire_date: -12 },
  { name: 'Tharushi Bandara',    email: 'tharushi@nexus.lk',     role: 'employee',    department: 'Engineering', position: 'QA Engineer',           hourly_rate: 1300, allowances: 10000, risk_bias: 0.08, hire_date: -24 },

  // New 15 — Low×6, Med×5, High×3, Crit×1
  { name: 'Amal Gunawardena',    email: 'amal.gunawardena@nexus.lk',    role: 'employee', department: 'Engineering', position: 'Software Developer',    hourly_rate: 1350, allowances: 12000, risk_bias: 0.02, hire_date: -20 },
  { name: 'Asanka Rathnayake',   email: 'asanka.rathnayake@nexus.lk',   role: 'employee', department: 'Engineering', position: 'Frontend Developer',    hourly_rate: 1400, allowances: 13000, risk_bias: 0.04, hire_date: -16 },
  { name: 'Chathura Senanayake', email: 'chathura.senanayake@nexus.lk', role: 'employee', department: 'Engineering', position: 'Backend Developer',     hourly_rate: 1450, allowances: 14000, risk_bias: 0.03, hire_date: -22 },
  { name: 'Dhanuka Dissanayake', email: 'dhanuka.dissanayake@nexus.lk', role: 'employee', department: 'Engineering', position: 'Systems Analyst',       hourly_rate: 1500, allowances: 15000, risk_bias: 0.05, hire_date: -10 },
  { name: 'Eranda Mendis',       email: 'eranda.mendis@nexus.lk',       role: 'employee', department: 'Engineering', position: 'QA Engineer',            hourly_rate: 1300, allowances: 11000, risk_bias: 0.01, hire_date: -28 },
  { name: 'Gayan Herath',        email: 'gayan.herath@nexus.lk',        role: 'employee', department: 'Engineering', position: 'DevOps Engineer',        hourly_rate: 1550, allowances: 16000, risk_bias: 0.04, hire_date: -14 },
  { name: 'Haritha Wijesinghe',  email: 'haritha.wijesinghe@nexus.lk',  role: 'employee', department: 'Engineering', position: 'Data Engineer',          hourly_rate: 1480, allowances: 14500, risk_bias: 0.08, hire_date: -18 },
  { name: 'Ishan Rajapaksa',     email: 'ishan.rajapaksa@nexus.lk',     role: 'employee', department: 'Engineering', position: 'Mobile Developer',       hourly_rate: 1420, allowances: 13000, risk_bias: 0.11, hire_date: -8  },
  { name: 'Janith Jayasuriya',   email: 'janith.jayasuriya@nexus.lk',   role: 'employee', department: 'Engineering', position: 'UI/UX Designer',         hourly_rate: 1350, allowances: 12000, risk_bias: 0.14, hire_date: -26 },
  { name: 'Kavindu Kumarasinghe',email: 'kavindu.kumarasinghe@nexus.lk',role: 'employee', department: 'Engineering', position: 'Software Developer',    hourly_rate: 1400, allowances: 13000, risk_bias: 0.07, hire_date: -12 },
  { name: 'Malith Abeywickrama', email: 'malith.abeywickrama@nexus.lk', role: 'employee', department: 'Engineering', position: 'Technical Lead',         hourly_rate: 1700, allowances: 18000, risk_bias: 0.13, hire_date: -32 },
  { name: 'Amaya Weerasinghe',   email: 'amaya.weerasinghe@nexus.lk',   role: 'employee', department: 'Engineering', position: 'Backend Developer',     hourly_rate: 1450, allowances: 14000, risk_bias: 0.19, hire_date: -6  },
  { name: 'Bimali Pathirana',    email: 'bimali.pathirana@nexus.lk',    role: 'employee', department: 'Engineering', position: 'Frontend Developer',    hourly_rate: 1380, allowances: 12500, risk_bias: 0.25, hire_date: -15 },
  { name: 'Chathurika Gamage',   email: 'chathurika.gamage@nexus.lk',   role: 'employee', department: 'Engineering', position: 'QA Engineer',            hourly_rate: 1320, allowances: 11000, risk_bias: 0.31, hire_date: -20 },
  { name: 'Dewmi Gunasekara',    email: 'dewmi.gunasekara@nexus.lk',    role: 'employee', department: 'Engineering', position: 'Systems Analyst',        hourly_rate: 1500, allowances: 15000, risk_bias: 0.40, hire_date: -9  },

  // ── Marketing (20 total: 4 original + 16 new) ────────────────────────────

  // Original 4
  { name: 'Kamal Wijesinghe',    email: 'kamal@nexus.lk',        role: 'employee',    department: 'Marketing', position: 'Marketing Executive',    hourly_rate: 1200, allowances: 10000, risk_bias: 0.02, hire_date: -28 },
  { name: 'Sachini Ratnayake',   email: 'sachini@nexus.lk',      role: 'manager',     department: 'Marketing', position: 'Marketing Manager',      hourly_rate: 1700, allowances: 18000, risk_bias: 0.06, hire_date: -32 },
  { name: 'Ashan Dissanayake',   email: 'ashan@nexus.lk',        role: 'employee',    department: 'Marketing', position: 'Content Strategist',     hourly_rate: 1250, allowances: 11000, risk_bias: 0.30, hire_date: -8  },
  { name: 'Nethmi Gamage',       email: 'nethmi@nexus.lk',       role: 'employee',    department: 'Marketing', position: 'Social Media Specialist', hourly_rate: 1100, allowances:  8000, risk_bias: 0.18, hire_date: -14 },

  // New 16 — Low×7, Med×5, High×3, Crit×1
  { name: 'Nadun Ranasinghe',    email: 'nadun.ranasinghe@nexus.lk',    role: 'employee', department: 'Marketing', position: 'Marketing Executive',     hourly_rate: 1200, allowances: 10000, risk_bias: 0.02, hire_date: -18 },
  { name: 'Osanda Marasinghe',   email: 'osanda.marasinghe@nexus.lk',   role: 'employee', department: 'Marketing', position: 'Content Writer',          hourly_rate: 1150, allowances:  9000, risk_bias: 0.04, hire_date: -24 },
  { name: 'Prasan Siriwardena',  email: 'prasan.siriwardena@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Digital Marketing Spec.',  hourly_rate: 1250, allowances: 11000, risk_bias: 0.01, hire_date: -12 },
  { name: 'Ravindu Karunarathne',email: 'ravindu.karunarathne@nexus.lk',role: 'employee', department: 'Marketing', position: 'Brand Manager',           hourly_rate: 1300, allowances: 12000, risk_bias: 0.03, hire_date: -30 },
  { name: 'Akila Liyanage',      email: 'akila.liyanage@nexus.lk',      role: 'employee', department: 'Marketing', position: 'SEO Specialist',          hourly_rate: 1200, allowances: 10000, risk_bias: 0.05, hire_date: -8  },
  { name: 'Buddhika Ranawaka',   email: 'buddhika.ranawaka@nexus.lk',   role: 'employee', department: 'Marketing', position: 'Copywriter',              hourly_rate: 1150, allowances:  9000, risk_bias: 0.03, hire_date: -20 },
  { name: 'Chanaka Seneviratne', email: 'chanaka.seneviratne@nexus.lk', role: 'employee', department: 'Marketing', position: 'Marketing Analyst',       hourly_rate: 1250, allowances: 11000, risk_bias: 0.04, hire_date: -16 },
  { name: 'Erandika Vithanage',  email: 'erandika.vithanage@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Social Media Manager',    hourly_rate: 1200, allowances: 10000, risk_bias: 0.09, hire_date: -14 },
  { name: 'Gayathri Wimalasiri', email: 'gayathri.wimalasiri@nexus.lk', role: 'employee', department: 'Marketing', position: 'Campaign Manager',        hourly_rate: 1300, allowances: 12000, risk_bias: 0.12, hire_date: -22 },
  { name: 'Hiruni Amarasinghe',  email: 'hiruni.amarasinghe@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Content Writer',          hourly_rate: 1150, allowances:  9000, risk_bias: 0.07, hire_date: -10 },
  { name: 'Ishani Chandrasena',  email: 'ishani.chandrasena@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Digital Marketing Spec.',  hourly_rate: 1220, allowances: 10500, risk_bias: 0.14, hire_date: -26 },
  { name: 'Jayani Dharmaratne',  email: 'jayani.dharmaratne@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Marketing Executive',     hourly_rate: 1250, allowances: 11000, risk_bias: 0.11, hire_date: -18 },
  { name: 'Kavya Edirisinghe',   email: 'kavya.edirisinghe@nexus.lk',   role: 'employee', department: 'Marketing', position: 'Brand Manager',           hourly_rate: 1300, allowances: 12000, risk_bias: 0.21, hire_date: -7  },
  { name: 'Lochani Fonseka',     email: 'lochani.fonseka@nexus.lk',     role: 'employee', department: 'Marketing', position: 'SEO Specialist',          hourly_rate: 1200, allowances: 10000, risk_bias: 0.28, hire_date: -13 },
  { name: 'Malsha Goonatilake',  email: 'malsha.goonatilake@nexus.lk',  role: 'employee', department: 'Marketing', position: 'Marketing Analyst',       hourly_rate: 1250, allowances: 11000, risk_bias: 0.33, hire_date: -19 },
  { name: 'Damith Hettiarachchi',email: 'damith.hettiarachchi@nexus.lk',role: 'employee', department: 'Marketing', position: 'Campaign Manager',        hourly_rate: 1300, allowances: 12000, risk_bias: 0.39, hire_date: -5  },

  // ── Finance (20 total: 4 original + 16 new) ──────────────────────────────

  // Original 4
  { name: 'Sunil Rajapaksa',     email: 'sunil@nexus.lk',        role: 'employee',    department: 'Finance', position: 'Accountant',           hourly_rate: 1600, allowances: 16000, risk_bias: 0.45, hire_date: -20 },
  { name: 'Chamari Herath',      email: 'chamari@nexus.lk',      role: 'manager',     department: 'Finance', position: 'Finance Manager',      hourly_rate: 1900, allowances: 20000, risk_bias: 0.04, hire_date: -34 },
  { name: 'Lahiru Mendis',       email: 'lahiru@nexus.lk',       role: 'employee',    department: 'Finance', position: 'Financial Analyst',    hourly_rate: 1500, allowances: 14000, risk_bias: 0.22, hire_date: -10 },
  { name: 'Isuri Wickramasinghe',email: 'isuri@nexus.lk',        role: 'employee',    department: 'Finance', position: 'Payroll Officer',      hourly_rate: 1350, allowances: 12000, risk_bias: 0.10, hire_date: -22 },

  // New 16 — Low×7, Med×6, High×2, Crit×1
  { name: 'Eshan Jayawardena',   email: 'eshan.jayawardena@nexus.lk',   role: 'employee', department: 'Finance', position: 'Accountant',            hourly_rate: 1350, allowances: 12000, risk_bias: 0.01, hire_date: -24 },
  { name: 'Gimhan Bandara',      email: 'gimhan.bandara@nexus.lk',      role: 'employee', department: 'Finance', position: 'Financial Analyst',     hourly_rate: 1500, allowances: 15000, risk_bias: 0.03, hire_date: -16 },
  { name: 'Hasitha Perera',      email: 'hasitha.perera@nexus.lk',      role: 'employee', department: 'Finance', position: 'Budget Analyst',        hourly_rate: 1400, allowances: 13000, risk_bias: 0.02, hire_date: -28 },
  { name: 'Isuru Fernando',      email: 'isuru.fernando@nexus.lk',      role: 'employee', department: 'Finance', position: 'Tax Consultant',        hourly_rate: 1550, allowances: 16000, risk_bias: 0.04, hire_date: -12 },
  { name: 'Jeewantha Silva',     email: 'jeewantha.silva@nexus.lk',     role: 'employee', department: 'Finance', position: 'Auditor',               hourly_rate: 1450, allowances: 14000, risk_bias: 0.05, hire_date: -20 },
  { name: 'Kosala Gunawardena',  email: 'kosala.gunawardena@nexus.lk',  role: 'employee', department: 'Finance', position: 'Credit Analyst',        hourly_rate: 1400, allowances: 13000, risk_bias: 0.02, hire_date: -8  },
  { name: 'Lasith Rathnayake',   email: 'lasith.rathnayake@nexus.lk',   role: 'employee', department: 'Finance', position: 'Cost Accountant',       hourly_rate: 1350, allowances: 12000, risk_bias: 0.04, hire_date: -32 },
  { name: 'Nimasha Senanayake',  email: 'nimasha.senanayake@nexus.lk',  role: 'employee', department: 'Finance', position: 'Treasury Analyst',      hourly_rate: 1500, allowances: 15000, risk_bias: 0.09, hire_date: -14 },
  { name: 'Pavithra Dissanayake',email: 'pavithra.dissanayake@nexus.lk',role: 'employee', department: 'Finance', position: 'Accountant',            hourly_rate: 1380, allowances: 12500, risk_bias: 0.12, hire_date: -22 },
  { name: 'Rashini Wijesinghe',  email: 'rashini.wijesinghe@nexus.lk',  role: 'employee', department: 'Finance', position: 'Financial Analyst',     hourly_rate: 1450, allowances: 14000, risk_bias: 0.06, hire_date: -18 },
  { name: 'Thisari Jayasuriya',  email: 'thisari.jayasuriya@nexus.lk',  role: 'employee', department: 'Finance', position: 'Investment Analyst',    hourly_rate: 1520, allowances: 16000, risk_bias: 0.14, hire_date: -10 },
  { name: 'Uthpala Kumarasinghe',email: 'uthpala.kumarasinghe@nexus.lk',role: 'employee', department: 'Finance', position: 'Budget Analyst',        hourly_rate: 1400, allowances: 13000, risk_bias: 0.10, hire_date: -26 },
  { name: 'Vimasha Abeywickrama',email: 'vimasha.abeywickrama@nexus.lk',role: 'employee', department: 'Finance', position: 'Cost Accountant',       hourly_rate: 1380, allowances: 12000, risk_bias: 0.08, hire_date: -6  },
  { name: 'Maduka Weerasinghe',  email: 'maduka.weerasinghe@nexus.lk',  role: 'employee', department: 'Finance', position: 'Auditor',               hourly_rate: 1450, allowances: 14000, risk_bias: 0.23, hire_date: -16 },
  { name: 'Warushi Pathirana',   email: 'warushi.pathirana@nexus.lk',   role: 'employee', department: 'Finance', position: 'Tax Consultant',        hourly_rate: 1500, allowances: 15000, risk_bias: 0.29, hire_date: -12 },
  { name: 'Yasasa Gamage',       email: 'yasasa.gamage@nexus.lk',       role: 'employee', department: 'Finance', position: 'Credit Analyst',        hourly_rate: 1420, allowances: 13500, risk_bias: 0.43, hire_date: -9  },

  // ── Operations (20 total: 4 original + 16 new) ───────────────────────────

  // Original 4
  { name: 'Pradeep Kumarasinghe',email: 'pradeep@nexus.lk',      role: 'employee',    department: 'Operations', position: 'Operations Coordinator', hourly_rate: 1200, allowances: 10000, risk_bias: 0.14, hire_date: -16 },
  { name: 'Sanduni Abeywickrama',email: 'sanduni@nexus.lk',      role: 'manager',     department: 'Operations', position: 'Operations Manager',     hourly_rate: 1750, allowances: 18000, risk_bias: 0.05, hire_date: -26 },
  { name: 'Amila Senanayake',    email: 'amila@nexus.lk',        role: 'employee',    department: 'Operations', position: 'Logistics Officer',      hourly_rate: 1150, allowances:  9000, risk_bias: 0.32, hire_date: -6  },
  { name: 'Dinusha Pathirana',   email: 'dinusha@nexus.lk',      role: 'employee',    department: 'Operations', position: 'Warehouse Supervisor',   hourly_rate: 1100, allowances:  8000, risk_bias: 0.20, hire_date: -15 },

  // New 16 — Low×8, Med×5, High×2, Crit×1
  { name: 'Namal Gunasekara',    email: 'namal.gunasekara@nexus.lk',    role: 'employee', department: 'Operations', position: 'Logistics Officer',       hourly_rate: 1150, allowances:  9000, risk_bias: 0.02, hire_date: -20 },
  { name: 'Oshan Ranasinghe',    email: 'oshan.ranasinghe@nexus.lk',    role: 'employee', department: 'Operations', position: 'Operations Coordinator',  hourly_rate: 1200, allowances: 10000, risk_bias: 0.04, hire_date: -14 },
  { name: 'Pasindu Marasinghe',  email: 'pasindu.marasinghe@nexus.lk',  role: 'employee', department: 'Operations', position: 'Supply Chain Analyst',    hourly_rate: 1250, allowances: 11000, risk_bias: 0.01, hire_date: -26 },
  { name: 'Rasika Siriwardena',  email: 'rasika.siriwardena@nexus.lk',  role: 'employee', department: 'Operations', position: 'Procurement Officer',     hourly_rate: 1200, allowances: 10000, risk_bias: 0.03, hire_date: -8  },
  { name: 'Sampath Karunarathne',email: 'sampath.karunarathne@nexus.lk',role: 'employee', department: 'Operations', position: 'Quality Inspector',       hourly_rate: 1150, allowances:  9000, risk_bias: 0.05, hire_date: -18 },
  { name: 'Thilina Liyanage',    email: 'thilina.liyanage@nexus.lk',    role: 'employee', department: 'Operations', position: 'Process Analyst',         hourly_rate: 1250, allowances: 11000, risk_bias: 0.02, hire_date: -30 },
  { name: 'Upul Ranawaka',       email: 'upul.ranawaka@nexus.lk',       role: 'employee', department: 'Operations', position: 'Distribution Manager',    hourly_rate: 1300, allowances: 12000, risk_bias: 0.04, hire_date: -12 },
  { name: 'Vasantha Seneviratne',email: 'vasantha.seneviratne@nexus.lk',role: 'employee', department: 'Operations', position: 'Logistics Officer',       hourly_rate: 1150, allowances:  9000, risk_bias: 0.03, hire_date: -22 },
  { name: 'Anoma Vithanage',     email: 'anoma.vithanage@nexus.lk',     role: 'employee', department: 'Operations', position: 'Supply Chain Analyst',    hourly_rate: 1250, allowances: 11000, risk_bias: 0.08, hire_date: -16 },
  { name: 'Bhagya Wimalasiri',   email: 'bhagya.wimalasiri@nexus.lk',   role: 'employee', department: 'Operations', position: 'Procurement Officer',     hourly_rate: 1200, allowances: 10000, risk_bias: 0.11, hire_date: -10 },
  { name: 'Chami Amarasinghe',   email: 'chami.amarasinghe@nexus.lk',   role: 'employee', department: 'Operations', position: 'Process Analyst',         hourly_rate: 1250, allowances: 11000, risk_bias: 0.13, hire_date: -24 },
  { name: 'Damayanthi Chandrasena', email: 'damayanthi.chandrasena@nexus.lk', role: 'employee', department: 'Operations', position: 'Operations Coordinator', hourly_rate: 1200, allowances: 10000, risk_bias: 0.07, hire_date: -6 },
  { name: 'Eroshika Dharmaratne',email: 'eroshika.dharmaratne@nexus.lk',role: 'employee', department: 'Operations', position: 'Quality Inspector',       hourly_rate: 1150, allowances:  9000, risk_bias: 0.09, hire_date: -28 },
  { name: 'Fathima Edirisinghe', email: 'fathima.edirisinghe@nexus.lk', role: 'employee', department: 'Operations', position: 'Logistics Officer',       hourly_rate: 1150, allowances:  9000, risk_bias: 0.22, hire_date: -14 },
  { name: 'Geethani Fonseka',    email: 'geethani.fonseka@nexus.lk',    role: 'employee', department: 'Operations', position: 'Supply Chain Analyst',    hourly_rate: 1200, allowances: 10000, risk_bias: 0.30, hire_date: -20 },
  { name: 'Hasini Goonatilake',  email: 'hasini.goonatilake@nexus.lk',  role: 'employee', department: 'Operations', position: 'Procurement Officer',     hourly_rate: 1200, allowances: 10000, risk_bias: 0.38, hire_date: -7  },

  // ── HR (20 total: 3 original + 17 new) ───────────────────────────────────

  // Original 3
  { name: 'Malini Gunawardena',  email: 'malini@nexus.lk',       role: 'hr_manager',  department: 'HR', position: 'HR Director',                   hourly_rate: 2000, allowances: 22000, risk_bias: 0.01, hire_date: -36 },
  { name: 'Nuwan Jayasuriya',    email: 'nuwan@nexus.lk',        role: 'hr_manager',  department: 'HR', position: 'HR Manager',                    hourly_rate: 1800, allowances: 18000, risk_bias: 0.09, hire_date: -30 },
  { name: 'Kavinda Weerasinghe', email: 'kavinda@nexus.lk',      role: 'admin',       department: 'HR', position: 'System Administrator',          hourly_rate: 1900, allowances: 20000, risk_bias: 0.07, hire_date: -24 },

  // New 17 — Low×7, Med×7, High×2, Crit×1
  { name: 'Waruna Hettiarachchi',email: 'waruna.hettiarachchi@nexus.lk',role: 'employee', department: 'HR', position: 'HR Officer',                  hourly_rate: 1250, allowances: 11000, risk_bias: 0.01, hire_date: -16 },
  { name: 'Yohan Iddamalgoda',   email: 'yohan.iddamalgoda@nexus.lk',   role: 'employee', department: 'HR', position: 'Recruitment Specialist',     hourly_rate: 1300, allowances: 12000, risk_bias: 0.03, hire_date: -24 },
  { name: 'Asith Perera',        email: 'asith.perera@nexus.lk',        role: 'employee', department: 'HR', position: 'Training Coordinator',       hourly_rate: 1250, allowances: 11000, risk_bias: 0.02, hire_date: -12 },
  { name: 'Binara Fernando',     email: 'binara.fernando@nexus.lk',     role: 'employee', department: 'HR', position: 'HR Analyst',                 hourly_rate: 1300, allowances: 12000, risk_bias: 0.04, hire_date: -28 },
  { name: 'Chaminda Silva',      email: 'chaminda.silva@nexus.lk',      role: 'employee', department: 'HR', position: 'HR Officer',                  hourly_rate: 1250, allowances: 11000, risk_bias: 0.03, hire_date: -8  },
  { name: 'Danula Jayawardena',  email: 'danula.jayawardena@nexus.lk',  role: 'employee', department: 'HR', position: 'Compensation Analyst',       hourly_rate: 1350, allowances: 13000, risk_bias: 0.05, hire_date: -20 },
  { name: 'Eranga Bandara',      email: 'eranga.bandara@nexus.lk',      role: 'employee', department: 'HR', position: 'HR Business Partner',        hourly_rate: 1400, allowances: 14000, risk_bias: 0.02, hire_date: -32 },
  { name: 'Hirantha Gunawardena',email: 'hirantha.gunawardena@nexus.lk',role: 'employee', department: 'HR', position: 'Talent Acquisition Spec.',   hourly_rate: 1350, allowances: 12000, risk_bias: 0.09, hire_date: -14 },
  { name: 'Iresha Rathnayake',   email: 'iresha.rathnayake@nexus.lk',   role: 'employee', department: 'HR', position: 'HR Officer',                  hourly_rate: 1250, allowances: 11000, risk_bias: 0.12, hire_date: -22 },
  { name: 'Jayamini Wickramasinghe', email: 'jayamini.wickramasinghe@nexus.lk', role: 'employee', department: 'HR', position: 'Recruitment Specialist', hourly_rate: 1300, allowances: 12000, risk_bias: 0.07, hire_date: -18 },
  { name: 'Kumari Senanayake',   email: 'kumari.senanayake@nexus.lk',   role: 'employee', department: 'HR', position: 'Training Coordinator',       hourly_rate: 1250, allowances: 11000, risk_bias: 0.14, hire_date: -10 },
  { name: 'Lakmali Dissanayake', email: 'lakmali.dissanayake@nexus.lk', role: 'employee', department: 'HR', position: 'Performance Mgmt. Analyst',  hourly_rate: 1350, allowances: 13000, risk_bias: 0.10, hire_date: -26 },
  { name: 'Madhavi Mendis',      email: 'madhavi.mendis@nexus.lk',      role: 'employee', department: 'HR', position: 'HR Analyst',                 hourly_rate: 1300, allowances: 12000, risk_bias: 0.06, hire_date: -6  },
  { name: 'Nadeeka Herath',      email: 'nadeeka.herath@nexus.lk',      role: 'employee', department: 'HR', position: 'Compensation Analyst',       hourly_rate: 1350, allowances: 13000, risk_bias: 0.08, hire_date: -16 },
  { name: 'Onela Rajapaksa',     email: 'onela.rajapaksa@nexus.lk',     role: 'employee', department: 'HR', position: 'HR Business Partner',        hourly_rate: 1400, allowances: 14000, risk_bias: 0.25, hire_date: -11 },
  { name: 'Priyanka Wijesinghe', email: 'priyanka.wijesinghe@nexus.lk', role: 'employee', department: 'HR', position: 'Talent Acquisition Spec.',   hourly_rate: 1350, allowances: 12000, risk_bias: 0.32, hire_date: -17 },
  { name: 'Indika Jayasuriya',   email: 'indika.jayasuriya@nexus.lk',   role: 'employee', department: 'HR', position: 'HR Administrator',           hourly_rate: 1300, allowances: 12000, risk_bias: 0.42, hire_date: -8  },
];

async function seedEmployees() {
  await Employee.deleteMany({});

  const hashedPassword = bcrypt.hashSync('nexus123', 12);
  const now = new Date();

  const docs = EMPLOYEES.map((emp) => {
    const hireDate = new Date(now);
    hireDate.setMonth(hireDate.getMonth() + emp.hire_date);

    return {
      name:        emp.name,
      email:       emp.email,
      password:    hashedPassword,
      role:        emp.role,
      department:  emp.department,
      position:    emp.position,
      hourly_rate: emp.hourly_rate,
      allowances:  emp.allowances,
      risk_bias:   emp.risk_bias,
      hire_date:   hireDate,
      is_active:   true,
    };
  });

  const inserted = await Employee.insertMany(docs);
  console.log(`  Seeded ${inserted.length} employees`);

  const dist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  EMPLOYEES.forEach((e) => {
    if      (e.risk_bias <= 0.05) dist.Low++;
    else if (e.risk_bias <= 0.15) dist.Medium++;
    else if (e.risk_bias <= 0.35) dist.High++;
    else                          dist.Critical++;
  });
  console.log(`  Dept distribution: Engineering=20 Marketing=20 Finance=20 Operations=20 HR=20`);
  console.log(`  Risk bias: Low=${dist.Low} Med=${dist.Medium} High=${dist.High} Crit=${dist.Critical}`);

  return inserted;
}

module.exports = seedEmployees;
