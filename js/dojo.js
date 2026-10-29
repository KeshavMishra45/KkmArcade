/* KKM Games: The Game Dojo.
   1) Card click -> blue glow -> black -> fire "Game Dojo entering" -> dojo opens.
   2) Every game route lives inside the dojo: title bar + a wooden INSTRUCTIONS sign that unrolls on click. */

const DOJO_RULES = {
  'tic-tac-toe': [
    'You play the <b>shuriken</b>. The computer plays the <b>Straw Hat</b> mark.',
    'Tap an empty square to place your mark. You move first.',
    'Line up <b>three in a row</b> (across, down or diagonal) to win.',
    'Win the number of games shown in the level goal to clear the level.',
    'Each win gives +10 points when you are logged in.',
  ],
  'rock-paper-scissors': [
    '<b>Devil Fruit</b> beats <b>Kunai</b>.',
    '<b>Kunai</b> beats <b>Death Note</b>.',
    '<b>Death Note</b> beats <b>Devil Fruit</b>.',
    'Pick a weapon and the computer picks at the same time. Same pick is a draw.',
    'Harder levels learn from your last picks, so mix it up. Win rounds to clear the level.',
  ],
  'ninja-ramen-rush': [
    'Move with the <b>arrow keys</b> or <b>WASD</b>. On a phone, swipe on the board or use the pad.',
    'Eat every chakra orb to clear the maze.',
    'Dodge the <b>Akatsuki</b>. Touching one costs a life.',
    'Grab <b>ramen</b> to unleash Kurama and chase them down for bonus points.',
    'Press <b>P</b> to pause. Reach the target score to clear the level.',
  ],
  'sliding-puzzle': [
    'Tap a tile next to the empty gap to slide it in.',
    'Rebuild the full picture to solve the puzzle.',
    '<b>Peek</b> shows the finished picture, <b>Numbers</b> labels the tiles, <b>Shuffle</b> starts over.',
    'Fewer moves and a faster time give a better best score.',
    'Solve it the number of times in the level goal to clear the level.',
  ],
  'memory-match': [
    'Flip two cards at a time.',
    'If they match they stay face up. If not, they flip back, so remember where they were.',
    'Find <b>every pair</b> to clear the board.',
    'Fewer moves earn more stars. The timer starts on your first flip.',
    'Clear boards to finish the level goal.',
  ],
};

/* ---------- dojo shell (title + instructions sign) ---------- */
function dojoLeave() {
  document.body.classList.remove('dojo');
  document.getElementById('dojoUI')?.remove();
}
function dojoSync(seg, slug) {
  const gi = seg === 'game' && typeof GAME_INFO !== 'undefined' ? GAME_INFO[slug] : null;
  if (!gi) return dojoLeave();
  const first = !document.body.classList.contains('dojo');
  document.body.classList.add('dojo');
  let ui = document.getElementById('dojoUI');
  const open = ui ? ui.classList.contains('open') && ui.dataset.slug === slug : false;
  ui?.remove();
  ui = document.createElement('div');
  ui.id = 'dojoUI'; ui.dataset.slug = slug;
  if (open) ui.classList.add('open');
  const rules = DOJO_RULES[slug] || [gi.blurb];
  ui.innerHTML = `
    <h1 class="dojo-title">THE GAME DOJO - ${gi.title.toUpperCase()}</h1>
    <div class="dcol">
    <div class="isign">
      <button class="iplank" aria-expanded="${open}" aria-controls="iscroll">INSTRUCTIONS<i aria-hidden="true">▾</i></button>
      <div class="iscroll" id="iscroll" role="region" aria-label="${gi.title} instructions">
        <div class="ipaper"><div class="pin">
          <h3>${gi.title}</h3>
          <ol>${rules.map(r => `<li>${r}</li>`).join('')}</ol>
          <p class="isig">KKM 忍者</p>
        </div></div>
      </div>
    </div>
    <div class="dstatwrap" hidden><div class="dplank">GAME STATS</div><div class="dstats" id="dstats"></div></div>
    </div>`;
  document.body.appendChild(ui);
  const btn = ui.querySelector('.iplank');
  btn.onclick = () => { const o = ui.classList.toggle('open'); btn.setAttribute('aria-expanded', o); };
  if (first) ui.classList.add('fresh');
  dojoStats();
}

/* On wide screens the level line, goal, scores/lives/timer and the back link move into the left GAME STATS panel,
   so the board gets the whole centre of the screen. Runs again every time a game re-renders (Play again etc). */
function dojoStats() {
  const box = document.getElementById('dstats'); if (!box) return;
  const wrap = box.parentElement, pg = view.querySelector('.play');
  if (!pg || !matchMedia('(min-width:1000px)').matches) { box.replaceChildren(); wrap.hidden = true; return; }
  const kids = [...pg.querySelectorAll('a.back, p.muted, .gstats, .pac-hud')].filter(el => {
    if (el.matches('p.muted')) return /^(Level|Log in)/.test(el.textContent.trim());
    return el.closest('.play') === pg;
  });
  const order = el => el.matches('a.back') ? 0 : el.matches('p.muted') && /^Level/.test(el.textContent.trim()) ? 1 : el.matches('.gstats') ? 2 : el.matches('.pac-hud') ? 3 : 4;
  kids.sort((a, b) => order(a) - order(b));
  if (!kids.length) return; // already moved (the observer fires again after our own move)
  box.replaceChildren(...kids);
  wrap.hidden = false;
  if (kids.length) setTimeout(() => dispatchEvent(new Event('resize')), 0); // the sliding puzzle re-fits itself to the freed space
}
new MutationObserver(() => dojoStats()).observe(document.getElementById('view'), { childList: true });
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const ui = document.getElementById('dojoUI');
  if (ui && ui.classList.contains('open')) { ui.classList.remove('open'); ui.querySelector('.iplank').setAttribute('aria-expanded', false); }
});

/* ---------- entry transition ---------- */
let gateBusy = false;
function dojoGate(href, srcEl) {
  if (gateBusy) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { location.hash = href; return; }
  gateBusy = true;
  const r = srcEl ? srcEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const g = document.createElement('div');
  g.id = 'gate';
  g.style.setProperty('--cx', cx + 'px'); g.style.setProperty('--cy', cy + 'px');
  const embers = Array.from({ length: 46 }, () =>
    `<s style="left:${(Math.random() * 100).toFixed(1)}%;--d:${(2 + Math.random() * 3).toFixed(2)}s;--w:${(Math.random() * 2.2).toFixed(2)}s;--x:${((Math.random() - .5) * 120) | 0}px;--z:${(2 + Math.random() * 4).toFixed(1)}px"></s>`).join('');
  g.innerHTML = `
    <div class="g-glow"></div>
    <div class="g-black"></div>
    <div class="g-fire">
      <div class="flames"><i></i><i></i><i></i><i></i></div>
      <div class="embers">${embers}</div>
      <div class="g-copy">
        <p class="g-top">GAME DOJO ENTERING...</p>
        <div class="g-logo"><img src="assets/img/shuriken.png" alt="" draggable="false"><b>KKM</b><span>GAMES</span></div>
        <p class="g-bot">TRANSITIONING TO THE DOJO...<br>GET READY!</p>
      </div>
    </div>`;
  document.body.appendChild(g);
  const at = (ms, fn) => setTimeout(fn, ms);
  at(20,   () => g.classList.add('s1'));      // blue light grows out of the card
  at(850,  () => g.classList.add('s2'));      // black screen
  at(1350, () => g.classList.add('s3'));      // fire screen
  at(3350, () => {                            // open the dojo underneath, then lift the fire
    location.hash = href;
    g.classList.add('s4');
  });
  at(4200, () => { g.remove(); gateBusy = false; });
}
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a.card');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  dojoGate(a.getAttribute('href'), a);
});
