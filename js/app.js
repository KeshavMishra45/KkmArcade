/* KKM Games front-end shell. Replace the TODO parts with real data/API later. */

// Games. `thumb` = card picture in assets/thumb/<thumb>.jpg. Each has its own route: #/game/<slug>
const GAMES = [
  { slug: 'tic-tac-toe',         name: 'Tic Tac Toe',         thumb: 'tic-tac-toe' },
  { slug: 'rock-paper-scissors', name: 'Rock Paper Scissors', thumb: 'rock-paper-scissors' },
  { slug: 'ninja-ramen-rush',    name: 'Ninja Ramen Rush',    thumb: 'ninja-ramen-rush' },
  { slug: 'sliding-puzzle',      name: 'Sliding Puzzle',      thumb: 'sliding-puzzle' },
  { slug: 'memory-match',        name: 'Memory Match',        thumb: 'memory-match' },
];

// Temporary state in localStorage (swap for a backend later)
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('kkm_' + k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('kkm_' + k, JSON.stringify(v)); } catch {} }
};
const today = () => new Date().toISOString().slice(0, 10);
// Daily challenges. Progress resets every day. TODO: load from backend later.
const CHALLENGES = [
  { id: 'ttt', title: 'Shuriken Showdown',   text: 'Win 3 Tic Tac Toe games.',         goal: 3, reward: 100, game: 'tic-tac-toe' },
  { id: 'rps', title: 'Fruit, Note, Kunai',  text: 'Win 3 Rock Paper Scissors rounds.', goal: 3, reward: 100, game: 'rock-paper-scissors' },
  { id: 'mem', title: 'Anime Memory',       text: 'Clear 2 Memory Match boards.',      goal: 2, reward: 100, game: 'memory-match', unit: 'boards' },
  { id: 'puz', title: 'Puzzle Master',      text: 'Solve 2 Sliding Puzzles.',          goal: 2, reward: 100, game: 'sliding-puzzle', unit: 'solves' },
  { id: 'pac', title: 'Ramen Rush',          text: 'Score 1,500 in Ninja Ramen Rush.',  goal: 1500, reward: 150, game: 'ninja-ramen-rush', unit: 'score' },
];
const BONUS = 50;      // for claiming both challenges
const WIN_POINTS = 10; // points for every single win (needs login)
function day() {
  let d = store.get('day', null);
  if (!d || d.date !== today()) d = { date: today(), claimed: {} };
  CHALLENGES.forEach(c => { if (d[c.id] == null) d[c.id] = 0; });
  store.set('day', d); return d;
}
function recordWin(id) {
  const d = day(), c = CHALLENGES.find(x => x.id === id);
  if (c && d[id] < c.goal) { d[id]++; store.set('day', d); }
}
function recordBest(id, v) {
  const d = day(), c = CHALLENGES.find(x => x.id === id);
  if (c) { d[id] = Math.min(c.goal, Math.max(d[id], v)); store.set('day', d); }
}
function addPoints(n) { if (!user) return false; points += n; store.set('points', points); syncHeader(); return true; }

// ---- Shuriken (red + black) used for points ----
const SHK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#d3122f" d="M12 0L15 9L12 12L9 9ZM12 24L9 15L12 12L15 15Z"/><path fill="#111" stroke="#555" stroke-width=".3" d="M24 12L15 9L12 12L15 15ZM0 12L9 15L12 12L9 9Z"/><circle cx="12" cy="12" r="2.6" fill="#07062a" stroke="#d3122f" stroke-width="1"/></svg>`;
const shk = () => `<span class="shk">${SHK}</span>`;
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---- Tiers + medals ----
const TIERS = [
  { n: 'Bronze',   min: 0,     c: '#cd7f32' },
  { n: 'Silver',   min: 1000,  c: '#c9ced9' },
  { n: 'Gold',     min: 3000,  c: '#ffcf4a' },
  { n: 'Platinum', min: 6000,  c: '#7fe3ff' },
  { n: 'Diamond',  min: 10000, c: '#b58cff' },
];
const tierOf = p => [...TIERS].reverse().find(t => p >= t.min) || TIERS[0];
const SILVER = TIERS[1];
const medal = t => `<svg class="medal" viewBox="0 0 40 54" role="img" aria-label="${t.n} medal">
  <path d="M9 0L20 22L24 22L15 0Z" fill="#c4122f"/><path d="M31 0L20 22L16 22L25 0Z" fill="#1d3fa8"/>
  <circle cx="20" cy="34" r="16" fill="${t.c}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>
  <circle cx="20" cy="34" r="11.5" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>
  <polygon points="20,26 22.3,31.5 28.2,31.9 23.7,35.7 25.1,41.4 20,38.3 14.9,41.4 16.3,35.7 11.8,31.9 17.7,31.5" fill="rgba(255,255,255,.85)"/></svg>`;

// ---- Original anime-style archetype avatars (not copyrighted characters) ----
const HAIR = {
  spiky:  '<polygon points="28,50 24,22 36,34 40,12 50,30 60,12 64,34 76,22 72,50 60,36 40,36"/>',
  tall:   '<polygon points="30,46 34,10 44,28 50,2 56,28 66,10 70,46 60,34 40,34"/>',
  bob:    '<path d="M27 58Q24 18 50 18Q76 18 73 58L66 58L66 40L34 40L34 58Z"/>',
  bun:    '<path d="M27 56Q24 20 50 20Q76 20 73 56L66 56L66 40L34 40L34 56Z"/><circle cx="50" cy="13" r="9"/>',
  swept:  '<path d="M27 50Q22 14 52 16Q80 18 73 50L64 40Q50 30 36 42Z"/>',
};
const EXTRA = {
  none: '',
  band: '<rect x="29" y="35" width="42" height="8" fill="#7d8aa8"/><rect x="43" y="36" width="14" height="6" fill="#cfd6ea"/>',
  mask: '<path d="M30 58H70V76Q50 84 30 76Z" fill="#1c1c2e"/>',
  hat:  '<ellipse cx="50" cy="30" rx="38" ry="8" fill="#e8c35a"/><path d="M32 30Q50 4 68 30Z" fill="#e8c35a"/><rect x="33" y="26" width="34" height="4" fill="#c4122f"/>',
  scar: '<path d="M40 40L46 56" stroke="#a02030" stroke-width="2"/>',
};
const AVATARS = [
  { id: 'a1', name: 'Spiky Shinobi',     price: 0,    bg: '#2a3cb8', hair: '#f08a24', eye: '#2b6cff', style: 'spiky', extra: 'band' },
  { id: 'a2', name: 'Straw Hat Captain', price: 500,  bg: '#a8321c', hair: '#18141e', eye: '#222',    style: 'bob',   extra: 'hat'  },
  { id: 'a3', name: 'Crimson Swordsman', price: 800,  bg: '#4a1d7a', hair: '#3a9a4a', eye: '#222',    style: 'swept', extra: 'scar' },
  { id: 'a4', name: 'Silver Sensei',     price: 1200, bg: '#1d4f7a', hair: '#d8dcec', eye: '#222',    style: 'swept', extra: 'mask' },
  { id: 'a5', name: 'Pink Medic',        price: 1500, bg: '#7a1d54', hair: '#ff8ab8', eye: '#2c9a5a', style: 'bob',   extra: 'none' },
  { id: 'a6', name: 'Dark Avenger',      price: 2000, bg: '#14141f', hair: '#0d0d16', eye: '#d3122f', style: 'spiky', extra: 'none' },
  { id: 'a7', name: 'Golden Hero',       price: 2500, bg: '#c9791c', hair: '#ffd84a', eye: '#12a0a0', style: 'tall',  extra: 'none' },
  { id: 'a8', name: 'Moon Princess',     price: 3000, bg: '#27337a', hair: '#f2e6a0', eye: '#4a7bff', style: 'bun',   extra: 'none' },
];
const avatarSVG = a => `<svg viewBox="0 0 100 100" role="img" aria-label="${a.name}"><rect width="100" height="100" fill="${a.bg}"/>
  <path d="M14 100Q16 74 50 72Q84 74 86 100Z" fill="#1a1a2e"/><rect x="44" y="64" width="12" height="12" fill="#f1c9a5"/>
  <ellipse cx="50" cy="50" rx="20" ry="24" fill="#f6d3b3"/>
  <g fill="${a.hair}">${HAIR[a.style]}</g>
  <ellipse cx="42" cy="52" rx="3.4" ry="4.4" fill="${a.eye}"/><ellipse cx="58" cy="52" rx="3.4" ry="4.4" fill="${a.eye}"/>
  <circle cx="43" cy="50.5" r="1.1" fill="#fff"/><circle cx="59" cy="50.5" r="1.1" fill="#fff"/>
  ${EXTRA[a.extra]}</svg>`;
const GUEST_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/></svg>`;

// ---- Banners: SVG scenes (1200x600, focal point centred so wide banners and tall cards both look right) ----
let _seed = 7; const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
const petals = (n, c) => Array.from({ length: n }, () =>
  `<ellipse cx="${(rnd() * 1200) | 0}" cy="${(rnd() * 600) | 0}" rx="${6 + rnd() * 7}" ry="${3 + rnd() * 4}" fill="${c}" opacity="${.5 + rnd() * .5}" transform="rotate(${(rnd() * 180) | 0} 600 300)"/>`).join('');
const stars = n => Array.from({ length: n }, () => `<circle cx="${(rnd() * 1200) | 0}" cy="${(rnd() * 300) | 0}" r="${rnd() * 1.8 + .4}" fill="#fff" opacity="${.4 + rnd() * .6}"/>`).join('');
const city = () => { let x = 0, out = ''; while (x < 1200) { const w = 40 + rnd() * 60, h = 90 + rnd() * 170;
  out += `<rect x="${x}" y="${600 - h}" width="${w}" height="${h}" fill="#0b0a2e"/>`;
  for (let i = 0; i < 7; i++) out += `<rect x="${x + 6 + rnd() * (w - 16)}" y="${600 - h + 10 + rnd() * (h - 20)}" width="5" height="7" fill="${rnd() > .5 ? '#46f0ff' : '#ff3d9a'}" opacity=".8"/>`; x += w + 4; } return out; };
const scene = (defs, body) => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`).replace(/'/g, '%27')}')`;
const grad = (id, a, b, v = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${v}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const BANNERS = [
  { id: 'b1', name: 'Night Shrine', price: 0, css: `linear-gradient(rgba(7,6,42,.2),rgba(7,6,42,.2)),url('assets/ui/kkm-bg-hd.jpg')` },
  { id: 'b2', name: 'Sakura Storm', price: 600, css: scene(grad('g', '#2a1060', '#d0457f'),
      `<rect width="1200" height="600" fill="url(#g)"/><circle cx="600" cy="250" r="80" fill="#ffe3f1"/>${petals(46, '#ffc2e0')}<path d="M0 600V470Q300 400 600 450T1200 440V600Z" fill="#240a45"/>`) },
  { id: 'b3', name: 'Crimson Moon', price: 1000, css: scene(grad('g', '#12060f', '#4a0b1e'),
      `<rect width="1200" height="600" fill="url(#g)"/>${stars(40)}<circle cx="600" cy="290" r="120" fill="#e0223c"/><circle cx="600" cy="290" r="92" fill="#ffd9d9"/><path d="M0 600V430L180 360L330 430L480 340L600 420L760 330L920 420L1060 360L1200 430V600Z" fill="#0a0409"/>`) },
  { id: 'b4', name: 'Cyber Tokyo', price: 1800, css: scene(grad('g', '#0a0f3d', '#6a1bd0'),
      `<rect width="1200" height="600" fill="url(#g)"/><circle cx="600" cy="330" r="110" fill="#ff3d9a" opacity=".85"/>${city()}<rect y="470" width="1200" height="3" fill="#46f0ff" opacity=".6"/>`) },
  { id: 'b5', name: 'Ocean Dusk', price: 2200, css: scene(grad('g', '#ff8a5a', '#3a2a7a'),
      `<rect width="1200" height="600" fill="url(#g)"/><circle cx="600" cy="320" r="70" fill="#ffe2a8"/><rect y="340" width="1200" height="260" fill="#0d1b4a"/><path d="M500 345H700M530 365H670M555 385H645" stroke="#ffe2a8" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M0 450Q150 430 300 450T600 450T900 450T1200 450M0 520Q150 500 300 520T600 520T900 520T1200 520" fill="none" stroke="#2a4fa0" stroke-width="3"/>`) },
  { id: 'b6', name: 'Golden Dojo', price: 3000, css: scene(grad('g', '#3a2406', '#c9902a', 'x1="0" y1="1" x2="1" y2="0"'),
      `<rect width="1200" height="600" fill="url(#g)"/><path d="M-100 700L700 -100M0 700L800 -100M100 700L900 -100M200 700L1000 -100M300 700L1100 -100M400 700L1200 -100M500 700L1300 -100M-200 700L600 -100" stroke="#ffe39a" stroke-opacity=".14" stroke-width="20"/><path d="M380 330Q600 250 820 330L780 345H420Z" fill="#1b0f02"/><rect x="450" y="345" width="300" height="120" fill="#2a1804"/><path d="M340 470H860V490H340Z" fill="#1b0f02"/><circle cx="600" cy="230" r="46" fill="#fff2c4"/>`) },
];
const getAv = id => AVATARS.find(a => a.id === id) || AVATARS[0];
const getBn = id => BANNERS.find(b => b.id === id) || BANNERS[0];

// ---- Profile text ----
const DEFAULT_DESCS = [
  'Just here to play, win and level up.',
  'Chasing the next high score, one game at a time.',
  'Night owl gamer. Strategy first, snacks second.',
];
const prof = () => store.get('profile', { desc: '', fav: GAMES[0].name, auto: Math.floor(Math.random() * DEFAULT_DESCS.length) });
const saveProf = p => store.set('profile', p);
const descOf = p => (p.desc && p.desc.trim()) || DEFAULT_DESCS[p.auto % DEFAULT_DESCS.length];

// ---- State ----
let user = store.get('user', null);
let inv = store.get('inv', { avatars: ['a1'], banners: ['b1'], av: 'a1', bn: 'b1' });
let points = store.get('points', 0);
// Demo account (demmo@gmail.com) has unlimited points so everything can be bought
const unlimited = () => !!user && user.email.toLowerCase() === 'demmo@gmail.com';
const afford = price => unlimited() || points >= price;
const fmt = n => unlimited() ? '∞' : n.toLocaleString();
const myTier = () => tierOf(unlimited() ? Infinity : points);
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');

function syncHeader() {
  $('#pts').textContent = fmt(points);
  document.querySelectorAll('.shk:empty').forEach(e => e.innerHTML = SHK);
  $('#miniAv').innerHTML = user ? avatarSVG(getAv(inv.av)) : GUEST_ICON;
  $('#loginBtn').textContent = user ? 'Log out (' + user.name + ')' : 'Log in';
}

const artHTML = g => `<div class="art thumb"><img src="assets/thumb/${g.thumb}.jpg" alt="" draggable="false"></div>`;
const cardHTML = (g, i) => `
  <a class="card" href="#/game/${g.slug}" data-i="${i}" aria-label="${g.name}">
    ${artHTML(g)}
    <div class="name">${g.name}</div>
  </a>`;

// ---- Home: hero + shuffling cards. order[slot] = game index ----
let timer = null, order = [0, 1, 2, 3, 4];
function paintSlots(flash = []) {
  document.querySelectorAll('.stage .card').forEach(c => {
    const i = +c.dataset.i;
    c.className = 'card slot-' + order.indexOf(i);
    if (flash.includes(i)) { c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1200); }
  });
  document.querySelectorAll('.dots i').forEach((d, n) => d.classList.toggle('on', n === order[2]));
}
function shuffleTwo() {
  const a = Math.floor(Math.random() * 5);
  let b; do { b = Math.floor(Math.random() * 5); } while (b === a);
  [order[a], order[b]] = [order[b], order[a]];
  paintSlots([order[a], order[b]]);
}
function scheduleShuffle() {
  clearTimeout(timer);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  timer = setTimeout(() => { shuffleTwo(); scheduleShuffle(); }, 7000 + Math.random() * 2000); // every 7-9 s
}
function rotate(dir) {
  order = dir > 0 ? [order[4], ...order.slice(0, 4)] : [...order.slice(1), order[0]];
  paintSlots(); scheduleShuffle();
}
function home() {
  const d = day(), done = CHALLENGES.filter(c => d[c.id] >= c.goal).length;
  view.innerHTML = `
  <section class="hero">
    <div>
      <p class="kicker">PLAY · EXPLORE · ENJOY</p>
      <h1>KKM Games</h1>
      <p class="tag">REAL GAMES. REAL STORIES. YOUR WORLD.</p>
      <p class="lead">Dive into a collection of unique games crafted for every kind of player. Adventure, strategy, creativity and more, all in one place.</p>
      <div class="cta"><a class="btn" href="#/games">Explore Games →</a></div>
      <div class="strip">
        <a class="chip" href="#/challenge"><span>Today's challenges</span><b>${done}/${CHALLENGES.length} done</b><span>Daily goals</span></a>
        <a class="chip" href="#/challenge"><span>Total points</span><b>${shk()}${fmt(points)}</b><span>${user ? esc(user.name) : 'Log in to save'}</span></a>
      </div>
    </div>
    <div class="stage" role="group" aria-label="Featured games">
      <button class="arrow l" aria-label="Previous">‹</button>
      ${GAMES.map(cardHTML).join('')}
      <button class="arrow r" aria-label="Next">›</button>
      <div class="dots">${GAMES.map(() => '<i></i>').join('')}</div>
    </div>
  </section>`;
  order = [0, 1, 2, 3, 4];
  paintSlots();
  $('.arrow.l').onclick = () => rotate(-1);
  $('.arrow.r').onclick = () => rotate(1);
  scheduleShuffle();
}

function games() {
  view.innerHTML = `<section class="page"><h2>Games</h2><p class="muted">Pick a game, then pick a level.</p>
    <div class="grid">${GAMES.map(cardHTML).join('')}</div>
    <p style="margin-top:2rem">${clearBtn()}</p></section>`;
}
function game(slug, sub) {
  if (openGame(slug, sub)) return;
  const g = GAMES.find(x => x.slug === slug);
  view.innerHTML = g
    ? `<section class="page"><h2>${g.name}</h2><p class="muted">Route: #/game/${g.slug}</p>
       <div class="panel"><h3>Coming soon</h3><p class="muted">Connect this route to the real game later.</p><a class="btn ghost" href="#/games">← All games</a></div></section>`
    : `<section class="page"><h2>Page not found</h2><a class="btn" href="#/games">Back to games</a></section>`;
}
function challenge() {
  const d = day(), both = CHALLENGES.every(c => d.claimed[c.id]);
  const row = c => {
    const n = Math.min(d[c.id], c.goal), ready = n >= c.goal;
    return `<div class="panel ch"><div class="ch-top"><h3>${c.title}</h3><span class="reward">${shk()}+${c.reward}</span></div>
      <p class="muted">${c.text}</p><div class="bar"><i style="width:${n / c.goal * 100}%"></i></div>
      <div class="ch-foot"><span class="muted">${n.toLocaleString()}/${c.goal.toLocaleString()} ${c.unit || 'wins'}</span>
      ${d.claimed[c.id] ? '<button class="btn" disabled>Claimed</button>' : ready ? `<button class="btn" data-claim="${c.id}">Claim</button>` : `<a class="btn ghost" href="#/game/${c.game}">Play →</a>`}</div></div>`;
  };
  view.innerHTML = `<section class="page"><h2>Today's Challenges</h2>
    <p class="muted">Resets every day. Every win also gives +${WIN_POINTS} points when you are logged in.</p>
    ${CHALLENGES.map(row).join('')}
    <div class="panel ch"><div class="ch-top"><h3>Finish all</h3><span class="reward">${shk()}+${BONUS}</span></div>
      <p class="muted">Claim every challenge above to unlock a bonus.</p>
      <div class="ch-foot"><span></span>${d.claimed.bonus ? '<button class="btn" disabled>Claimed</button>' : both ? '<button class="btn" data-claim="bonus">Claim</button>' : '<button class="btn ghost" disabled>Locked</button>'}</div></div>
    <div class="panel"><p class="muted">Total points</p><div class="big">${shk()}${fmt(points)}</div></div>
    <p style="margin-top:1.5rem">${clearBtn()}</p></section>`;
  view.querySelectorAll('[data-claim]').forEach(b => b.onclick = () => {
    if (!user) return $('#loginDlg').showModal();
    const cid = b.dataset.claim, c = CHALLENGES.find(x => x.id === cid), dd = day();
    dd.claimed[cid] = true; store.set('day', dd);
    addPoints(c ? c.reward : BONUS); challenge();
  });
}

// ---- Profile card (slides out from the right, banner as background) ----
let lastFocus = null;
function closeCard() {
  const w = $('#pcardWrap'); if (!w) return;
  w.classList.add('out'); setTimeout(() => { w.remove(); lastFocus && lastFocus.focus && lastFocus.focus(); }, 300);
}
function openCard(p) {
  $('#pcardWrap')?.remove();
  lastFocus = document.activeElement;
  const w = document.createElement('div');
  w.id = 'pcardWrap';
  w.innerHTML = `<div class="pc-bd"></div>
    <aside class="pcard" role="dialog" aria-label="${esc(p.name)} profile" style="background-image:linear-gradient(180deg,rgba(7,6,42,0) 0%,rgba(7,6,42,.3) 50%,rgba(7,6,42,.92) 100%),${getBn(p.bn).css}">
      <button class="pc-x" aria-label="Close">✕</button>
      <div class="pc-body">
        <div class="av big-av">${avatarSVG(getAv(p.av))}</div>
        <div class="pc-medal">${medal(p.tier)}<span>${p.tier.n} tier</span></div>
        <h3>${esc(p.name)}</h3>
        <p class="pc-desc">${esc(p.desc)}</p>
        <div class="pc-stats">
          <div><span>Points</span><b>${shk()}${p.pts}</b></div>
          <div><span>Favourite game</span><b>${esc(p.fav)}</b></div>
        </div>
      </div>
    </aside>`;
  document.body.appendChild(w);
  w.querySelector('.pc-x').focus();
  w.querySelector('.pc-x').onclick = closeCard;
  w.querySelector('.pc-bd').onclick = closeCard;
}
addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });

const PLAYERS = [
  { name: 'Shadow-kun', av: 'a6', bn: 'b3', pts: 12840, fav: 'Sliding Puzzle' },
  { name: 'Akira',      av: 'a1', bn: 'b4', pts: 9120,  fav: 'Tic Tac Toe' },
  { name: 'Mika',       av: 'a5', bn: 'b2', pts: 8450,  fav: 'Ninja Ramen Rush' },
  { name: 'Ryo',        av: 'a3', bn: 'b1', pts: 7300,  fav: 'Rock Paper Scissors' },
  { name: 'Sora',       av: 'a8', bn: 'b5', pts: 6100,  fav: 'Memory Match' },
  { name: 'Hana',       av: 'a4', bn: 'b2', pts: 4200,  fav: 'Rock Paper Scissors' },
  { name: 'Kenji',      av: 'a7', bn: 'b6', pts: 2900,  fav: 'Sliding Puzzle' },
  { name: 'Yuki',       av: 'a2', bn: 'b3', pts: 1800,  fav: 'Tic Tac Toe' },
];
function leaderboard() {
  const rows = PLAYERS.map((p, i) => ({ ...p, me: false, tier: SILVER, desc: DEFAULT_DESCS[i % 3], sort: p.pts, pts: p.pts.toLocaleString() }));
  if (user) { const pr = prof(); rows.push({ name: user.name, av: inv.av, bn: inv.bn, fav: pr.fav, desc: descOf(pr), tier: myTier(), me: true, sort: unlimited() ? Infinity : points, pts: fmt(points) }); }
  rows.sort((x, y) => y.sort - x.sort);
  view.innerHTML = `<section class="page"><h2>Leaderboard</h2><p class="muted">Click a player to open their card. Sample players for now; connect real scores later.</p>
    <ol class="lb">${rows.map((r, i) => `<li class="${r.me ? 'me' : ''}" tabindex="0" role="button" data-i="${i}"><span class="rk">${i + 1}</span>
      <span class="av">${avatarSVG(getAv(r.av))}</span><span class="nm">${esc(r.name)}${r.me ? ' (you)' : ''}</span>
      <span class="lbm">${medal(r.tier)}</span><b>${shk()}${r.pts}</b></li>`).join('')}</ol>
    ${user ? '' : '<p class="muted">Log in to see your own rank.</p>'}</section>`;
  view.querySelectorAll('.lb li').forEach(li => {
    const open = () => openCard(rows[+li.dataset.i]);
    li.onclick = open; li.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  });
}

// ---- Profile page (edit name/description free, buy avatar + banner) ----
function profile() {
  if (!user) {
    view.innerHTML = `<section class="page"><h2>Profile</h2><div class="panel"><h3>Log in to continue</h3><p class="muted">Your avatar, banner and points live here.</p><button class="btn" id="goLogin">Log in</button></div></section>`;
    $('#goLogin').onclick = () => $('#loginDlg').showModal();
    return;
  }
  const pr = prof(); saveProf(pr);
  const btn = (kind, it) => {
    const owned = inv[kind + 's'].includes(it.id), on = inv[kind === 'avatar' ? 'av' : 'bn'] === it.id;
    if (on) return `<button class="btn ghost" disabled>Equipped</button>`;
    if (owned) return `<button class="btn" data-act="equip" data-k="${kind}" data-id="${it.id}">Equip</button>`;
    return `<button class="btn" data-act="buy" data-k="${kind}" data-id="${it.id}" ${afford(it.price) ? '' : 'disabled'}>${afford(it.price) ? 'Buy' : 'Not enough'}</button>`;
  };
  const price = (kind, it) => inv[kind + 's'].includes(it.id) ? 'Owned' : (it.price ? shk() + it.price.toLocaleString() : 'Free');
  const t = myTier();
  view.innerHTML = `<section class="page">
    <div class="banner" style="background-image:${getBn(inv.bn).css}"></div>
    <div class="me-head">
      <div class="avcol"><div class="av">${avatarSVG(getAv(inv.av))}</div><div class="pc-medal">${medal(t)}<span>${t.n}</span></div></div>
      <div class="who"><h2>${esc(user.name)}</h2><p class="muted" style="margin:.2rem 0 .6rem">${esc(user.email)} · ${shk()}${fmt(points)}</p>
        <button class="btn ghost" id="preview">Preview my card</button></div>
    </div>
    <form class="panel edit" id="editForm">
      <h3>Edit profile</h3><p class="muted">Name, description and favourite game are free to change anytime.</p>
      <label>Name<input id="eName" maxlength="24" value="${esc(user.name)}"></label>
      <label>Description<textarea id="eDesc" maxlength="140" rows="3" placeholder="${esc(DEFAULT_DESCS[pr.auto % 3])}">${esc(pr.desc)}</textarea></label>
      <p class="muted small">Leave it empty to show a default gamer line.</p>
      <label>Favourite game<select id="eFav">${GAMES.map(g => `<option ${g.name === pr.fav ? 'selected' : ''}>${g.name}</option>`).join('')}</select></label>
      <div class="row"><span class="muted" id="saved"></span><button class="btn" type="submit">Save</button></div>
    </form>
    <h3 class="sec">Avatars</h3>
    <div class="shop">${AVATARS.map(a => `<div class="item ${inv.av === a.id ? 'eq' : ''}"><div class="av">${avatarSVG(a)}</div><b>${a.name}</b><div class="price">${price('avatar', a)}</div>${btn('avatar', a)}</div>`).join('')}</div>
    <h3 class="sec">Banners</h3>
    <div class="shop">${BANNERS.map(b => `<div class="item ${inv.bn === b.id ? 'eq' : ''}"><div class="bn" style="background-image:${b.css}"></div><b>${b.name}</b><div class="price">${price('banner', b)}</div>${btn('banner', b)}</div>`).join('')}</div>
  </section>`;
  $('#editForm').onsubmit = e => {
    e.preventDefault();
    user.name = $('#eName').value.trim() || user.name; store.set('user', user);
    pr.desc = $('#eDesc').value.trim(); pr.fav = $('#eFav').value; saveProf(pr);
    syncHeader(); profile(); $('#saved').textContent = 'Saved';
  };
  $('#preview').onclick = () => openCard({ name: user.name, av: inv.av, bn: inv.bn, tier: t, desc: descOf(pr), pts: fmt(points), fav: pr.fav });
  view.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const kind = b.dataset.k, list = kind === 'avatar' ? AVATARS : BANNERS, it = list.find(x => x.id === b.dataset.id);
    if (b.dataset.act === 'buy') {
      if (!afford(it.price)) return;
      if (!unlimited()) { points -= it.price; store.set('points', points); }
      inv[kind + 's'].push(it.id);
    }
    inv[kind === 'avatar' ? 'av' : 'bn'] = it.id;
    store.set('inv', inv); syncHeader(); profile();
  });
}

const routes = { '': home, games, challenge, leaderboard, profile, me: profile };
function route() {
  if (gameCleanup) gameCleanup();
  clearTimeout(timer); $('#pcardWrap')?.remove();
  const [seg, arg, sub] = location.hash.replace(/^#\/?/, '').split('/');
  if (seg === 'game') game(arg, sub); else (routes[seg] || (() => game('')))();
  dojoSync(seg, arg);
  const key = seg === '' ? 'home' : seg === 'game' ? 'games' : seg;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === key));
  $('#miniAv').classList.toggle('active', seg === 'profile' || seg === 'me');
  scrollTo(0, 0);
}
addEventListener('hashchange', route);

// Demo login (front only)
$('#loginBtn').onclick = () => {
  if (user) { user = null; store.set('user', null); syncHeader(); return route(); }
  $('#loginDlg').showModal();
};
$('#loginForm').addEventListener('submit', e => {
  if (e.submitter && e.submitter.value === 'ok') {
    user = { name: $('#uName').value.trim() || 'demo', email: $('#uMail').value.trim() || 'demmo@gmail.com' };
    store.set('user', user);
    if (!store.get('demo10k', false)) { points = 10000; store.set('points', points); store.set('demo10k', true); }
    syncHeader(); setTimeout(route, 0);
  }
});

// ---- Clear game history (records, level progress, best scores, daily challenge). Points and purchases stay. ----
document.addEventListener('click', e => { if (e.target.closest('[data-clear]')) $('#clearDlg').showModal(); });
$('#clearForm').addEventListener('submit', e => {
  if (e.submitter && e.submitter.value === 'ok') {
    ['rec', 'prog', 'pacbest', 'membest', 'day'].forEach(k => store.set(k, null));
    setTimeout(() => { route(); toast('History cleared'); }, 0);
  }
});

syncHeader(); route();
