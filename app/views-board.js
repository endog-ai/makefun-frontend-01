import { esc, money, date, timeLeft } from './format.js';

export function board(data) {
  const { items, next_cursor } = data;
  const rows = items.map(item => {
    const { slug, title, potUsd, rewardAmount, entryFeeUsd, deadline, submissionCount } = item;
    const pot = potUsd ?? rewardAmount;
    const potHtml = `<strong>${money(pot)}</strong>`;
    const entryFeeHtml = entryFeeUsd ? `${money(entryFeeUsd)} entry fee` : 'free';
    const deadlineHtml = `<span data-countdown="${deadline}">${timeLeft(deadline)}</span>`;
    const entriesHtml = `${submissionCount} entries`;
    return `
      <a href="#/bounty/${slug}" class="board-row">
        ${esc(title)} ${potHtml} ${entryFeeHtml} ${deadlineHtml} ${entriesHtml}
      </a>`;
  }).join('');

  return `
    <section class="board">
      <h1>Open bounties</h1>
      <input id="q" placeholder="Search bounties" />
      <div class="sort-buttons">
        <button data-sort="pot">Pot</button>
        <button data-sort="closing">Closing</button>
        <button data-sort="newest">Newest</button>
        <button data-sort="entries">Entries</button>
      </div>
      <div class="filter-buttons">
        <button data-filter="all">All</button>
        <button data-filter="free">Free</button>
        <button data-filter="soon">Soon</button>
      </div>
      <div class="board-rows">
        ${rows}
      </div>
    </section>`;
}

export function bounty(b) {
  const {
    slug,
    title,
    summary,
    description,
    rules,
    status,
    potUsd,
    rewardAmount,
    entryFeeUsd,
    deadline,
    opensAt,
    publishedAt,
    submissionCount,
    rewards,
    rewardsNow,
    skills,
    sponsor
  } = b;

  const pot = potUsd ?? rewardAmount;
  const entryFee = entryFeeUsd ? money(entryFeeUsd) : 'free';
  const statusText = new Date(deadline) > new Date()
    ? `${status} — entries open`
    : `${status} — entries closed`;
  const deadlineText = `${date(deadline)} (${timeLeft(deadline)})`;

  const rewardsList = (rewardsNow && rewardsNow.length) ? rewardsNow : rewards;
  const rewardsRows = rewardsList.map(r => {
    const amount = r.amountUsd ?? r.amount;
    return `<tr><td>${esc(r.title || r.name || '')}</td><td>${money(amount)}</td></tr>`;
  }).join('');

  return `
    <section class="bounty-detail">
      <a href="#/">Back</a>
      <h1>${esc(title)}</h1>
      <p>${esc(summary)}</p>
      <ul class="facts">
        <li>Reward: ${money(pot)}</li>
        <li>Entry fee: ${entryFee}</li>
        <li>Status: ${esc(statusText)}</li>
        <li>Deadline: ${esc(deadlineText)}</li>
        ${opensAt ? `<li>Opens: ${esc(date(opensAt))}</li>` : ''}
        ${publishedAt ? `<li>Published: ${esc(date(publishedAt))}</li>` : ''}
        <li>Entries: ${submissionCount}</li>
      </ul>
      <h2>Rewards</h2>
      <table class="rewards-table">
        <thead><tr><th>Reward</th><th>Amount</th></tr></thead>
        <tbody>${rewardsRows}</tbody>
      </table>
      <h2>Description</h2>
      <div class="description">${esc(description)}</div>
      ${rules ? `<h2>Rules</h2><div class="rules">${esc(rules)}</div>` : ''}
      <a href="#/bounty/${slug}/leaderboard">Leaderboard</a>
    </section>`;
}

