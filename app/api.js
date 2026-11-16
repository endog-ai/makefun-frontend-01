const BASE = 'https://make.fun/api';

// In‑memory ETag cache
const etagCache = new Map();

// Load persisted cache from localStorage if available
if (typeof localStorage !== 'undefined') {
  try {
    const stored = localStorage.getItem('oc-cache-v1');
    if (stored) {
      const obj = JSON.parse(stored);
      for (const [k, v] of Object.entries(obj)) {
        etagCache.set(k, v);
      }
    }
  } catch (_) {}
}

async function request(path) {
  const url = `${BASE}${path}`;
  const cached = etagCache.get(url);
  const headers = {};
  if (cached && cached.etag) {
    headers['If-None-Match'] = cached.etag;
  }
  const resp = await fetch(url, { headers });
  if (resp.status === 304) {
    if (cached) return cached.body;
    throw new Error('HTTP 304 but no cached body');
  }
  if (!resp.ok) {
    throw new Error('HTTP ' + resp.status);
  }
  const body = await resp.json();
  const etag = resp.headers.get('ETag');
  if (etag) {
    const entry = { etag, body };
    etagCache.set(url, entry);
    if (typeof localStorage !== 'undefined') {
      const all = Object.fromEntries(etagCache.entries());
      try { localStorage.setItem('oc-cache-v1', JSON.stringify(all)); } catch (_) {}
    }
  }
  return body;
}

export async function getBounties(cursor) {
  let path = '/competitions?status=open&activity=times&limit=10';
  if (cursor) path += '&cursor=' + encodeURIComponent(cursor);
  return request(path);
}

export async function getBounty(slug) {
  return request('/competitions/' + encodeURIComponent(slug));
}

export async function getLeaderboard(slug) {
  return request('/competitions/' + encodeURIComponent(slug) + '/leaderboard?rows=all');
}

export async function getProfile(handle) {
  return request('/profiles/' + encodeURIComponent(handle));
}
