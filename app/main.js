// Router file
import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty } from './views-board.js';
import { leaderboard, profile } from './views-extra.js';
import { countdown } from './format.js';

const appEl = document.getElementById('app');
let boardCache = [];
let cursorStack = [];
let currentCursor = null;

function setReady(flag) {
  window.__shotReady = flag;
}

function showLoading() {
  setReady(false);
  appEl.innerHTML = '<p>Loading...</p>';
}

function showError(err, retryFn) {
  setReady(false);
  appEl.innerHTML = `<p>${err}</p><button id="retry">Retry</button>`;
  document.getElementById('retry').addEventListener('click', retryFn);
}

function renderNotFound() {
  setReady(true);
  document.title = 'Not found';
  appEl.innerHTML = `<p>Not found</p><a href="#/">Home</a>`;
}

async function renderBoard() {
  try {
    showLoading();
    if (boardCache.length === 0) {
      const data = await getBounties();
      boardCache = data.items;
      currentCursor = data.nextCursor || null;
    }
    setReady(true);
    document.title = 'Bounties';
    appEl.innerHTML = board({ items: boardCache });
    wireBoardControls();
  } catch (e) {
    showError(e.message, renderBoard);
  }
}

function wireBoardControls() {
  const search = document.getElementById('q');
  if (search) {
    search.addEventListener('input', () => applyBoardFilters());
  }
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sort = btn.getAttribute('data-sort');
      applyBoardSort(sort);
    });
  });
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      applyBoardFilter(filter);
    });
  });
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (!currentCursor) return;
      try {
        showLoading();
        const data = await getBounties(currentCursor);
        cursorStack.push(currentCursor);
        currentCursor = data.nextCursor || null;
        boardCache = data.items;
        setReady(true);
        appEl.innerHTML = board({ items: boardCache });
        wireBoardControls();
      } catch (e) {
        showError(e.message, renderBoard);
      }
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      const prevCursor = cursorStack.pop();
      if (!prevCursor) return;
      try {
        showLoading();
        const data = await getBounties(prevCursor);
        currentCursor = prevCursor;
        boardCache = data.items;
        setReady(true);
        appEl.innerHTML = board({ items: boardCache });
        wireBoardControls();
      } catch (e) {
        showError(e.message, renderBoard);
      }
    });
  }
}

let currentBoardFilter = null;
let currentBoardSort = null;

function applyBoardFilter(filter) {
  currentBoardFilter = filter;
  applyBoardFilters();
}

function applyBoardSort(sort) {
  currentBoardSort = sort;
  applyBoardFilters();
}

function applyBoardFilters() {
  let items = [...boardCache];
  const q = document.getElementById('q');
  if (q && q.value) {
    const term = q.value.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(term));
  }
  if (currentBoardFilter) {
    if (currentBoardFilter === 'free') {
      items = items.filter(i => !i.entryFeeUsd);
    } else if (currentBoardFilter === 'soon') {
      const now = Date.now();
      items = items.filter(i => i.deadline && new Date(i.deadline).getTime() - now < 24 * 3600 * 1000);
    } // 'all' does nothing
  }
  if (currentBoardSort) {
    if (currentBoardSort === 'pot') {
      items.sort((a, b) => (b.potUsd || 0) - (a.potUsd || 0));
    } else if (currentBoardSort === 'closing') {
      items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (currentBoardSort === 'newest') {
      items.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    } else if (currentBoardSort === 'entries') {
      items.sort((a, b) => (b.submissionCount || 0) - (a.submissionCount || 0));
    }
  }
  setReady(true);
  appEl.innerHTML = board({ items });
  wireBoardControls();
}

async function renderBounty(slug) {
  try {
    showLoading();
    const data = await getBounty(slug);
    setReady(true);
    document.title = data.title || 'Bounty';
    appEl.innerHTML = bounty(data);
  } catch (e) {
    showError(e.message, () => renderBounty(slug));
  }
}

async function renderLeaderboard(slug) {
  try {
    showLoading();
    const data = await getLeaderboard(slug);
    setReady(true);
    document.title = 'Leaderboard';
    appEl.innerHTML = leaderboard(slug, data);
  } catch (e) {
    showError(e.message, () => renderLeaderboard(slug));
  }
}

async function renderProfile(handle) {
  try {
    showLoading();
    const data = await getProfile(handle);
    setReady(true);
    document.title = handle;
    appEl.innerHTML = profile(handle, data);
  } catch (e) {
    showError(e.message, () => renderProfile(handle));
  }
}

function router() {
  const hash = location.hash || '#/';
  const boardRegex = /^#\/$/;
  const bountyRegex = /^#\/bounty\/([^/]+)$/;
  const leaderboardRegex = /^#\/bounty\/([^/]+)\/leaderboard$/;
  const profileRegex = /^#\/u\/([^/]+)$/;

  if (boardRegex.test(hash)) {
    renderBoard();
  } else if (bountyRegex.test(hash)) {
    const slug = hash.match(bountyRegex)[1];
    renderBounty(slug);
  } else if (leaderboardRegex.test(hash)) {
    const slug = hash.match(leaderboardRegex)[1];
    renderLeaderboard(slug);
  } else if (profileRegex.test(hash)) {
    const handle = hash.match(profileRegex)[1];
    renderProfile(handle);
  } else {
    renderNotFound();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

setInterval(() => {
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const target = el.getAttribute('data-countdown');
    el.textContent = countdown(target);
  });
}, 1000);

