// Time helpers for the programme tracker. All programme dates/times are Asia/Colombo (UTC+05:30, no DST).
const OFFSET_MIN = 330;

function colomboNow(now = new Date()) {
  return new Date(now.getTime() + OFFSET_MIN * 60000);
}

// YYYY-MM-DD for "today" in Colombo
function todayColombo(now = new Date()) {
  return colomboNow(now).toISOString().slice(0, 10);
}

// HH:MM for "now" in Colombo
function nowTimeColombo(now = new Date()) {
  return colomboNow(now).toISOString().slice(11, 16);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Instant (Date) for a Colombo date + HH:MM
function toInstant(dateStr, hhmm) {
  return new Date(`${dateStr}T${hhmm}:00+05:30`);
}

function isValidTime(t) {
  return typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

function isValidDate(d) {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'));
}

function minutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// "13:15" -> "1:15 PM"
function pretty(t) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

// "2026-10-30" -> "Fri 30 Oct"
function prettyDate(d) {
  const dt = new Date(d + 'T00:00:00Z');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[dt.getUTCDay()]} ${dt.getUTCDate()} ${months[dt.getUTCMonth()]}`;
}

// Sri Lankan numbers: 0771234567 -> 94771234567. Returns digits only, or null.
function normalizePhone(raw) {
  if (!raw) return null;
  let p = String(raw).replace(/[^\d+]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('0') && p.length === 10) p = '94' + p.slice(1);
  if (p.length === 9 && p.startsWith('7')) p = '94' + p;
  return p.length >= 10 ? p : null;
}

function waLink(phone, message) {
  const p = normalizePhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  todayColombo, nowTimeColombo, addDays, toInstant, isValidTime, isValidDate,
  minutes, pretty, prettyDate, normalizePhone, waLink,
};
