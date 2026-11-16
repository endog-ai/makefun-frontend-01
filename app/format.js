export function esc(s) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(s).replace(/[&<>\"']/g, ch => map[ch]);
}

export function money(v) {
  const num = Number(v);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function date(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const datePart = d.toLocaleDateString('en-US', { dateStyle: 'medium' });
  const timePart = d.toLocaleTimeString('en-US', { timeStyle: 'short', hour12: false, timeZone: 'UTC' });
  return `${datePart} ${timePart} UTC`;
}

function diffMs(iso) {
  return new Date(iso) - new Date();
}

export function timeLeft(iso) {
  const diff = diffMs(iso);
  if (diff <= 0) return 'ended';
  const minutes = Math.floor(diff / 60000);
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export function countdown(iso) {
  const diff = diffMs(iso);
  if (diff <= 0) return 'ended';
  let remaining = diff / 1000; // seconds
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  return `${days}d ${hours}h ${minutes}m ${String(seconds).padStart(2, '0')}s`;
}
