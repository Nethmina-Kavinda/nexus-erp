const PDFDocument = require('pdfkit');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const RiskScore = require('../models/RiskScore');
const HRDecision = require('../models/HRDecision');
const Inventory = require('../models/Inventory');

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

function drawLine(doc, y, color = '#2D3748') {
  doc.save().moveTo(40, y).lineTo(doc.page.width - 40, y).lineWidth(0.5).strokeColor(color).stroke().restore();
}

function sectionHeader(doc, text) {
  doc.moveDown(0.6);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1A365D').text(text.toUpperCase(), 40, doc.y);
  drawLine(doc, doc.y + 3, '#3B82F6');
  doc.moveDown(0.5);
}

function kpiBox(doc, x, y, w, label, value) {
  doc.save()
    .rect(x, y, w, 38).fillColor('#F7FAFC').fill()
    .rect(x, y, w, 38).lineWidth(0.5).strokeColor('#CBD5E0').stroke()
    .fontSize(7).font('Helvetica').fillColor('#718096').text(label, x + 8, y + 7, { width: w - 16 })
    .fontSize(13).font('Helvetica-Bold').fillColor('#1A202C').text(value, x + 8, y + 18, { width: w - 16 })
    .restore();
}

function tableHeader(doc, columns) {
  const y = doc.y;
  let x = 40;
  doc.save().rect(40, y, doc.page.width - 80, 16).fillColor('#2D3748').fill().restore();
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
  columns.forEach(({ label, width }) => {
    doc.text(label, x + 4, y + 4, { width: width - 8, ellipsis: true });
    x += width;
  });
  doc.y = y + 16;
}

function tableRow(doc, columns, values, isAlt) {
  const y = doc.y;
  const rowH = 14;
  if (isAlt) {
    doc.save().rect(40, y, doc.page.width - 80, rowH).fillColor('#F7FAFC').fill().restore();
  }
  let x = 40;
  doc.fontSize(7).font('Helvetica').fillColor('#2D3748');
  columns.forEach(({ width }, i) => {
    const val = values[i] ?? '—';
    doc.text(String(val), x + 4, y + 3, { width: width - 8, ellipsis: true });
    x += width;
  });
  doc.y = y + rowH;
}

function riskColor(cls) {
  const map = { Low: '#14B8A6', Medium: '#F59E0B', High: '#3B82F6', Critical: '#EF4444' };
  return map[cls] || '#718096';
}

function pageHeader(doc, title, subtitle, generated) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1A202C').text('NEXUS ERP', 40, 40);
  doc.fontSize(10).font('Helvetica').fillColor('#4A5568').text(title, 40, doc.y + 2);
  doc.fontSize(8).font('Helvetica').fillColor('#718096').text(`${subtitle}   |   Generated: ${generated}`, 40, doc.y + 2);
  drawLine(doc, doc.y + 6, '#3B82F6');
  doc.y = doc.y + 14;
}

// ── monthly report ─────────────────────────────────────────────────────────

async function buildMonthlyReport(doc, month) {
  const generated = new Date().toLocaleString('en-LK');
  pageHeader(doc, `Monthly HR Report — ${month}`, 'Attendance · Payroll · Risk · Decisions', generated);

  // Fetch data
  const [employees, payrolls, riskScores, decisions, attAgg] = await Promise.all([
    Employee.find({ is_active: true }).lean(),
    Payroll.find({ month }).lean(),
    RiskScore.find({ month }).lean(),
    HRDecision.find({ month }).populate('employee_id decided_by', 'name').lean(),
    Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${month}-01`),
            $lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)),
          },
        },
      },
      {
        $group: {
          _id: '$employee_id',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  // Build lookup maps
  const payMap  = Object.fromEntries(payrolls.map((p) => [String(p.employee_id), p]));
  const riskMap = Object.fromEntries(riskScores.map((r) => [String(r.employee_id), r]));
  const attMap  = Object.fromEntries(attAgg.map((a) => [String(a._id), a]));

  // Executive KPIs
  sectionHeader(doc, 'Executive Summary');

  const totalEmp = employees.length;
  const totalPresent = attAgg.reduce((s, a) => s + a.present + a.late, 0);
  const totalDays = attAgg.reduce((s, a) => s + a.present + a.absent + a.late, 0);
  const attRate = totalDays ? ((totalPresent / totalDays) * 100).toFixed(1) : '0.0';
  const payrollTotal = payrolls.reduce((s, p) => s + (p.final_salary || 0), 0);
  const riskDist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  riskScores.forEach((r) => { if (riskDist[r.risk_class] !== undefined) riskDist[r.risk_class]++; });
  const wrl = totalEmp ? (((riskDist.High + riskDist.Critical) / totalEmp) * 100).toFixed(1) : '0.0';

  const kpiW = (doc.page.width - 100) / 4;
  const kpiY = doc.y;
  kpiBox(doc, 40, kpiY, kpiW - 5, 'Total Employees', String(totalEmp));
  kpiBox(doc, 40 + kpiW, kpiY, kpiW - 5, 'Attendance Rate', `${attRate}%`);
  kpiBox(doc, 40 + kpiW * 2, kpiY, kpiW - 5, 'Monthly Payroll (LKR)', fmt(payrollTotal));
  kpiBox(doc, 40 + kpiW * 3, kpiY, kpiW - 5, 'Workforce Risk Level', `${wrl}%`);
  doc.y = kpiY + 48;

  // Risk distribution
  sectionHeader(doc, 'Risk Distribution');
  const rw = (doc.page.width - 100) / 4;
  const ry = doc.y;
  [['Low', '#14B8A6'], ['Medium', '#F59E0B'], ['High', '#3B82F6'], ['Critical', '#EF4444']].forEach(([cls, color], i) => {
    doc.save()
      .rect(40 + rw * i, ry, rw - 5, 28).fillColor('#F7FAFC').fill()
      .rect(40 + rw * i, ry, 3, 28).fillColor(color).fill()
      .fontSize(7).font('Helvetica').fillColor('#718096').text(cls, 50 + rw * i, ry + 5)
      .fontSize(14).font('Helvetica-Bold').fillColor('#1A202C').text(String(riskDist[cls]), 50 + rw * i, ry + 13)
      .restore();
  });
  doc.y = ry + 38;

  // Department breakdown
  sectionHeader(doc, 'Department Risk Breakdown');
  const deptMap = {};
  employees.forEach((e) => {
    if (!deptMap[e.department]) deptMap[e.department] = { count: 0, scoreSum: 0, classes: {} };
    const rs = riskMap[String(e._id)];
    deptMap[e.department].count++;
    if (rs) {
      deptMap[e.department].scoreSum += rs.risk_score || 0;
      deptMap[e.department].classes[rs.risk_class] = (deptMap[e.department].classes[rs.risk_class] || 0) + 1;
    }
  });
  const deptCols = [
    { label: 'Department',    width: 130 },
    { label: 'Employees',     width: 80 },
    { label: 'Avg Risk Score', width: 110 },
    { label: 'Dominant Class', width: 110 },
  ];
  tableHeader(doc, deptCols);
  Object.entries(deptMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([dept, d], i) => {
    const avg = d.count ? (d.scoreSum / d.count).toFixed(1) : '—';
    const dominant = Object.entries(d.classes).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    tableRow(doc, deptCols, [dept, d.count, avg, dominant], i % 2 === 1);
  });
  doc.moveDown(0.4);

  // Employee details table — add new page if needed
  if (doc.y > doc.page.height - 180) doc.addPage();
  sectionHeader(doc, 'Employee Details');
  const empCols = [
    { label: 'Name',              width: 110 },
    { label: 'Department',        width: 90 },
    { label: 'Present',           width: 50 },
    { label: 'Absent',            width: 50 },
    { label: 'Late',              width: 45 },
    { label: 'Final Salary (LKR)', width: 100 },
    { label: 'Risk Class',        width: 70 },
    { label: 'ML',                width: 35 },
  ];
  tableHeader(doc, empCols);
  const sorted = [...employees].sort((a, b) =>
    a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
  );
  sorted.forEach((e, i) => {
    if (doc.y > doc.page.height - 30) {
      doc.addPage();
      tableHeader(doc, empCols);
    }
    const att = attMap[String(e._id)] || {};
    const pay = payMap[String(e._id)];
    const rs  = riskMap[String(e._id)];
    tableRow(doc, empCols, [
      e.name,
      e.department,
      att.present ?? '—',
      att.absent ?? '—',
      att.late ?? '—',
      pay ? fmt(pay.final_salary) : '—',
      rs?.risk_class || '—',
      rs?.ml_status === 'predicted' ? 'ML' : 'FML',
    ], i % 2 === 1);
  });
  doc.moveDown(0.4);

  // HR Decisions
  if (decisions.length > 0) {
    if (doc.y > doc.page.height - 160) doc.addPage();
    sectionHeader(doc, `HR Decisions — ${month}`);
    const decCols = [
      { label: 'Employee',     width: 110 },
      { label: 'Original',     width: 70 },
      { label: 'Decision',     width: 65 },
      { label: 'Corrected To', width: 80 },
      { label: 'Decided By',   width: 100 },
      { label: 'Date',         width: 85 },
    ];
    tableHeader(doc, decCols);
    decisions.forEach((d, i) => {
      if (doc.y > doc.page.height - 30) {
        doc.addPage();
        tableHeader(doc, decCols);
      }
      tableRow(doc, decCols, [
        d.employee_id?.name || '—',
        d.original_class,
        d.decision.toUpperCase(),
        d.corrected_class || '—',
        d.decided_by?.name || '—',
        d.decided_at ? new Date(d.decided_at).toLocaleDateString('en-LK') : '—',
      ], i % 2 === 1);
    });
  }
}

// ── daily report ───────────────────────────────────────────────────────────

async function buildDailyReport(doc, date) {
  const generated = new Date().toLocaleString('en-LK');
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd   = new Date(`${date}T23:59:59.999Z`);

  pageHeader(doc, `Daily Attendance Report — ${date}`, 'Attendance · Inventory Alerts', generated);

  const [records, inventory] = await Promise.all([
    Attendance.find({ date: { $gte: dayStart, $lte: dayEnd } }).populate('employee_id', 'name department').lean(),
    Inventory.find().lean(),
  ]);

  // Summary
  sectionHeader(doc, 'Daily Summary');
  const counts = { present: 0, absent: 0, late: 0 };
  records.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
  const total = records.length;

  const sw = (doc.page.width - 100) / 4;
  const sy = doc.y;
  [['Present', counts.present, '#14B8A6'], ['Late', counts.late, '#F59E0B'], ['Absent', counts.absent, '#EF4444'], ['Total', total, '#3B82F6']].forEach(([lbl, val, color], i) => {
    doc.save()
      .rect(40 + sw * i, sy, sw - 5, 28).fillColor('#F7FAFC').fill()
      .rect(40 + sw * i, sy, 3, 28).fillColor(color).fill()
      .fontSize(7).font('Helvetica').fillColor('#718096').text(lbl, 50 + sw * i, sy + 5)
      .fontSize(14).font('Helvetica-Bold').fillColor('#1A202C').text(String(val), 50 + sw * i, sy + 13)
      .restore();
  });
  doc.y = sy + 38;

  // Attendance table
  sectionHeader(doc, 'Attendance Details');
  const attCols = [
    { label: 'Name',        width: 130 },
    { label: 'Department',  width: 100 },
    { label: 'Status',      width: 65 },
    { label: 'Check-In',    width: 70 },
    { label: 'Check-Out',   width: 70 },
    { label: 'Late (mins)', width: 70 },
    { label: 'OT (hrs)',    width: 55 },
  ];
  tableHeader(doc, attCols);
  const sortedRec = [...records].sort((a, b) => {
    const da = a.employee_id?.department || '';
    const db = b.employee_id?.department || '';
    return da.localeCompare(db) || (a.employee_id?.name || '').localeCompare(b.employee_id?.name || '');
  });
  sortedRec.forEach((r, i) => {
    if (doc.y > doc.page.height - 30) {
      doc.addPage();
      tableHeader(doc, attCols);
    }
    tableRow(doc, attCols, [
      r.employee_id?.name || '—',
      r.employee_id?.department || '—',
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
      fmtDate(r.check_in),
      fmtDate(r.check_out),
      r.late_minutes || 0,
      (r.overtime_hours || 0).toFixed(2),
    ], i % 2 === 1);
  });
  doc.moveDown(0.4);

  // Inventory alerts
  const alerts = inventory.filter((item) => item.quantity <= item.reorder_level);
  if (alerts.length > 0) {
    if (doc.y > doc.page.height - 120) doc.addPage();
    sectionHeader(doc, 'Inventory Alerts');
    const invCols = [
      { label: 'Item',           width: 160 },
      { label: 'Category',       width: 110 },
      { label: 'Current Stock',  width: 100 },
      { label: 'Reorder Level',  width: 100 },
    ];
    tableHeader(doc, invCols);
    alerts.forEach((item, i) => {
      tableRow(doc, invCols, [
        item.name,
        item.category.replace('_', ' '),
        item.quantity,
        item.reorder_level,
      ], i % 2 === 1);
    });
  }
}

// ── main controller ────────────────────────────────────────────────────────

exports.generateReport = async (req, res, next) => {
  try {
    const { type, date, month } = req.body;

    if (!type || !['daily', 'monthly'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type must be "daily" or "monthly"' });
    }
    if (type === 'daily' && !date) {
      return res.status(400).json({ success: false, error: 'date (YYYY-MM-DD) is required for daily reports' });
    }
    if (type === 'monthly' && !month) {
      return res.status(400).json({ success: false, error: 'month (YYYY-MM) is required for monthly reports' });
    }

    const filename = type === 'monthly'
      ? `NEXUS_Monthly_Report_${month}.pdf`
      : `NEXUS_Daily_Report_${date}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    doc.pipe(res);

    if (type === 'monthly') {
      await buildMonthlyReport(doc, month);
    } else {
      await buildDailyReport(doc, date);
    }

    // Footer on every page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      const pageBottom = doc.page.height - 25;
      drawLine(doc, pageBottom - 6, '#CBD5E0');
      doc.fontSize(7).font('Helvetica').fillColor('#A0AEC0')
        .text('NEXUS ERP — Confidential HR Document', 40, pageBottom, { align: 'left', width: 300 })
        .text(`Page ${i + 1} of ${pages.count}`, 40, pageBottom, { align: 'right', width: doc.page.width - 80 });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};
