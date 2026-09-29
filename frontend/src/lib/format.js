export const RISK_TIERS = ['Low', 'Medium', 'High', 'Critical'];

// Risk tiers use the reserved status palette, in order of severity.
export const RISK_COLORS = {
  Low:      'var(--good)',
  Medium:   'var(--warn)',
  High:     'var(--serious)',
  Critical: 'var(--danger)',
};


// Months covered by the seeded dataset (Oct 2025 – Mar 2026), oldest first.
export const DATA_MONTHS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
export const LATEST_MONTH = DATA_MONTHS[DATA_MONTHS.length - 1];

export function initials(name) {
  return name?.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** '2026-03' → 'Mar' | 'Mar 2026' | 'March 2026' */
export function formatMonth(ym, style = 'medium') {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  if (!m) return ym;
  if (style === 'short') return MONTHS[m - 1];
  if (style === 'long') return `${MONTHS_LONG[m - 1]} ${y}`;
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatLKR(amount) {
  return Math.round(amount || 0).toLocaleString();
}

/** 12_400_000 → '12.4M' */
export function compact(n) {
  const v = Number(n) || 0;
  const trim = (x) => x.toFixed(1).replace(/\.0$/, '');
  if (Math.abs(v) >= 1e6) return `${trim(v / 1e6)}M`;
  if (Math.abs(v) >= 1e3) return `${trim(v / 1e3)}K`;
  return String(Math.round(v));
}

const ROLE_LABELS = { admin: 'Admin', hr_manager: 'HR Manager', manager: 'Manager', employee: 'Employee' };
export function formatRole(role) {
  return ROLE_LABELS[role] || (role || '').replace(/_/g, ' ');
}

export function humanize(feature) {
  const s = (feature || '').replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Weighted company average of department average risk scores. */
export function companyAverage(departments = []) {
  const people = departments.reduce((s, d) => s + (d.count || 0), 0);
  return people ? departments.reduce((s, d) => s + (d.avg_risk || 0) * (d.count || 0), 0) / people : 0;
}

/** Case-insensitive "does any field contain the query" check for client-side search. */
export function matchesQuery(query, ...fields) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}

/** Subtitle helper: "12 of 100 employees match “kav”" or "100 employees". */
export function countLabel(shown, total, noun, query) {
  return query?.trim() ? `${shown} of ${total} ${noun} match “${query.trim()}”` : `${total} ${noun}`;
}
