// Views extra module
import { esc, money, date } from './format.js';

export function leaderboard(slug, data) {
  const backLink = `<a href="#/bounty/${esc(slug)}">Back</a>`;
  const rows = data.entries.map(entry => {
    const winRate = (entry.values.judge / 1000000).toFixed(4);
    const size = `${entry.values.bytes} bytes`;
    return `<tr>
      <td>${esc(entry.rank.toString())}</td>
      <td><a href="#/u/${esc(entry.handle)}">${esc(entry.handle)}</a></td>
      <td>${esc(entry.title)}</td>
      <td>${esc(winRate)}</td>
      <td>${esc(size)}</td>
    </tr>`;
  }).join('\n');
  return `
    ${backLink}
    <h1>Leaderboard</h1>
    <table>
      <thead>
        <tr><th>Rank</th><th>Entrant</th><th>Entry title</th><th>Win rate</th><th>Size</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

export function profile(handle, data) {
  const bio = data.bio ? esc(data.bio) : 'No bio yet.';
  const links = [];
  if (data.github_login) links.push(`<a href="https://github.com/${esc(data.github_login)}">GitHub</a>`);
  if (data.x) links.push(`<a href="https://x.com/${esc(data.x)}">X</a>`);
  if (data.discord) links.push(esc(data.discord));
  if (data.wallet && data.wallet.explorer_url) links.push(`<a href="${esc(data.wallet.explorer_url)}">Wallet</a>`);
  const record = data.record || {};
  const recordItems = [];
  if (record.competitions_entered !== undefined) recordItems.push(`Entered: ${esc(record.competitions_entered.toString())}`);
  if (record.competitions_placed !== undefined) recordItems.push(`Placed: ${esc(record.competitions_placed.toString())}`);
  if (record.competitions_won !== undefined) recordItems.push(`Won: ${esc(record.competitions_won.toString())}`);
  if (record.prize_usd !== undefined) recordItems.push(`Prize money: ${money(record.prize_usd)}`);
  if (record.best_placement !== undefined) recordItems.push(`Best placement: ${esc(record.best_placement.toString())}`);
  const solutions = (data.solutions || []).map(sol => {
    const titleLink = `<a href="#/bounty/${esc(sol.competition.slug)}">${esc(sol.title)}</a>`;
    const placement = sol.placement ? `Placed #${esc(sol.placement.toString())}` : 'Unplaced';
    const prize = sol.prize_usd ? ` $${money(sol.prize_usd)}` : '';
    return `<li>${titleLink} – ${placement}${prize}</li>`;
  }).join('\n');
  return `
    <h1>${esc(handle)}</h1>
    <p>${bio}</p>
    ${links.length ? `<ul><li>${links.join('</li>\n<li>')}</li></ul>` : ''}
    <ul>
      ${recordItems.map(item => `<li>${item}</li>`).join('\n')}
    </ul>
    <h2>Solutions</h2>
    <ul>
      ${solutions}
    </ul>`;
}

