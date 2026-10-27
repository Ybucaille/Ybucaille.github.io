const root = document.documentElement;
root.classList.add('js');
let currentHits = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 860px)').matches;
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const layerSections = $$('.layer');
const NAMES = ['INTERFACES & IA', 'BUREAU & GPU', 'LIGNE DE COMMANDE', 'SERVICES', 'SYSTÈME & RÉSEAU', 'SOCLE'];
const SHORT = ['interfaces & IA', 'bureau & GPU', 'ligne de commande', 'services', 'système & réseau', 'socle'];

// stagger indexes for CSS
$$('.tech').forEach(t => [...t.children].forEach((s, i) => s.style.setProperty('--i', i)));
$$('.certs li').forEach((li, i) => li.style.setProperty('--i', i));

// ---------- reveal ----------
const revealIO = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
}), { threshold: 0.18 });
$$('.reveal, .layer-head, .project, .certs').forEach(el => revealIO.observe(el));

// ---------- scroll state ----------
let stack = null;
const state = { mode: 'intro', layer: -1, project: null };
const where = { n: document.querySelector('.where-n'), t: document.querySelector('.where-t') };
const railLinks = $$('.rail a');

function apply() {
  const { mode, layer } = state;
  railLinks.forEach((a, i) => a.setAttribute('aria-current', String(i === layer && mode !== 'intro' && mode !== 'tech')));
  const label = mode === 'intro' ? ['00', 'surface']
    : mode === 'tech' ? ['≡', 'index des technos']
    : mode === 'job' ? ['07', 'à construire']
    : mode === 'end' ? ['07', 'contact']
    : [String(layer + 1).padStart(2, '0'), SHORT[layer]];
  root.classList.toggle('far', mode === 'job' || mode === 'end');
  where.n.textContent = label[0]; where.t.textContent = label[1];
  stack?.setState({ ...state, hits: currentHits });
}

// the element under the middle of the viewport sets the mode
const modeEls = $$('[data-mode]');
let lastEl = null;
function track() {
  const mid = innerHeight / 2;
  let el = modeEls[0];
  for (const m of modeEls) { if (m.getBoundingClientRect().top <= mid) el = m; else break; }
  if (el === lastEl) return;
  lastEl = el;
  const sec = el.closest('.layer');
  state.mode = el.dataset.mode;
  state.layer = sec ? +sec.dataset.layer : state.mode === 'tech' ? 4 : state.mode === 'intro' ? -1 : 5;
  state.project = el.dataset.project || null;
  if (state.mode !== 'tech') setHits(null);
  apply();
}
let tracking = false;
addEventListener('scroll', () => { if (!tracking) { tracking = true; requestAnimationFrame(() => { tracking = false; track(); }); } }, { passive: true });
addEventListener('resize', track);

// hovering a short entry lights its block
$$('.also li, .path li[data-project]').forEach(li => {
  li.addEventListener('pointerenter', () => { li.classList.add('lit'); stack?.setState({ project: li.dataset.project }); });
  li.addEventListener('pointerleave', () => { li.classList.remove('lit'); stack?.setState({ project: state.project }); });
});

// ---------- videos: load and play only when visible ----------
const vidIO = new IntersectionObserver(entries => entries.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) {
    if (!v.src) { v.src = v.dataset.src; }
    if (!reduced) v.play().catch(() => {});
  } else v.pause();
}), { threshold: 0.35 });
$$('video[data-src]').forEach(v => { if (reduced) v.controls = true; vidIO.observe(v); });

const sound = document.querySelector('.sound');
sound?.addEventListener('click', () => {
  const v = sound.previousElementSibling;
  if (!v.src) v.src = v.dataset.src;
  v.muted = !v.muted;
  if (!v.muted) v.play().catch(() => {});
  sound.setAttribute('aria-pressed', String(!v.muted));
  sound.textContent = v.muted ? 'Activer le son' : 'Couper le son';
});

// ---------- terminals ----------
function paint(line) {
  const span = document.createElement('span');
  if (line.startsWith('$')) span.className = 'p';
  else if (line.startsWith('#')) span.className = 'k';
  span.textContent = line + '\n';
  return span;
}
$$('pre[data-type]').forEach(pre => {
  const code = pre.querySelector('code');
  const lines = code.textContent.split('\n');
  if (reduced) { code.replaceChildren(...lines.map(paint)); return; }
  code.textContent = '';
  const caret = document.createElement('span'); caret.className = 'caret';
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    let i = 0;
    const step = () => {
      if (i >= lines.length) { code.append(caret); return; }
      code.append(paint(lines[i]));
      pre.scrollTop = pre.scrollHeight;
      const next = lines[i + 1] || '';
      i++;
      setTimeout(step, next.startsWith('$') ? 650 : lines[i - 1].startsWith('$') ? 420 : 75);
    };
    step();
  }, { threshold: 0.5 });
  io.observe(pre);
});

// ---------- technology index ----------
function setHits(set) { currentHits = set; stack?.setState({ hits: set }); }
const techMap = new Map();
$$('[data-tech]').forEach(el => {
  const name = el.querySelector('h3, strong')?.textContent.trim();
  el.dataset.tech.split(',').forEach(t => {
    if (!techMap.has(t)) techMap.set(t, []);
    techMap.get(t).push({ id: el.dataset.project, name });
  });
});
const list = document.getElementById('ti-list');
const out = document.getElementById('ti-out');
let pinned = null;
const techs = [...techMap].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'fr'));
function show(t) {
  if (!t) { setHits(null); out.innerHTML = '&nbsp;'; return; }
  const p = techMap.get(t);
  setHits(new Set(p.map(x => x.id)));
  out.textContent = `${t} → ${p.map(x => x.name).join(', ')}`;
}
techs.forEach(([t, p]) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.append(t);
  const sup = document.createElement('sup'); sup.textContent = p.length; b.append(sup);
  b.addEventListener('pointerenter', () => show(t));
  b.addEventListener('focus', () => show(t));
  b.addEventListener('click', () => {
    pinned = pinned === t ? null : t;
    $$('button', list).forEach(x => x.setAttribute('aria-pressed', String(x === b && pinned === t)));
    show(pinned);
  });
  li.append(b); list.append(li);
});
list.addEventListener('pointerleave', () => show(pinned));

// ---------- alternance band wipes in with the scroll ----------
const job = document.querySelector('.job');
if (!reduced) {
  let ticking = false;
  const wipe = () => {
    ticking = false;
    const r = job.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.7)));
    job.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(wipe); } }, { passive: true });
  wipe();
}

// ---------- CV tilt, copy ----------
const cv = document.querySelector('.cv a');
if (cv && !reduced && !mobile) {
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    cv.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 22}deg`);
    cv.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`);
  });
  cv.addEventListener('pointerleave', () => { cv.style.removeProperty('--ry'); cv.style.removeProperty('--rx'); });
}
$$('.copy').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Adresse copiée'; }
  catch { b.textContent = b.dataset.copy; }
}));

// ---------- theme ----------
const themeBtn = document.querySelector('.theme');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function setTheme(t, save) {
  root.dataset.theme = t;
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre');
  themeMeta.content = t === 'dark' ? '#141512' : '#e3e2dc';
  if (save) try { localStorage.setItem('theme', t); } catch {}
  stack?.setTheme(t);
}
setTheme(root.dataset.theme || 'light');
themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

// ---------- CV in a dialog ----------
const cvd = document.querySelector('.cvd');
const cvBody = cvd.querySelector('.cvd-body');
const pdf = 'assets/pdf/bucaille-yann.pdf';
function openCv() {
  if (!cvBody.firstChild) {
    if (matchMedia('(pointer: fine) and (min-width: 861px)').matches) {
      const f = document.createElement('iframe');
      f.src = pdf + '#view=FitH&toolbar=0';
      f.title = 'CV de Yann Bucaille (PDF)';
      cvBody.append(f);
    } else {
      const img = document.createElement('img');
      img.src = 'assets/media/cv-full.webp'; img.alt = 'CV de Yann Bucaille'; img.width = 1406; img.height = 1988;
      cvBody.append(img);
    }
  }
  cvd.showModal();
  root.classList.add('modal');
}
cvd.addEventListener('close', () => root.classList.remove('modal'));
cvd.querySelector('.cvd-x').addEventListener('click', () => cvd.close());
cvd.addEventListener('click', e => { if (e.target === cvd) cvd.close(); });
$$(`a[href="${pdf}"]:not([download]):not([data-raw])`).forEach(a => a.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  openCv();
}));

// ---------- 3D stack (progressive enhancement) ----------
async function boot() {
  const canvas = document.getElementById('stack');
  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) return;
    const { initStack } = await import('./stack.js');
    await document.fonts.ready;
    const layers = layerSections.map(s => $$('[data-project]', s).map(el => el.dataset.project));
    const labels = Object.fromEntries($$('[data-project]').map(el => [el.dataset.project, el.dataset.label || el.querySelector('h3, strong')?.textContent.trim()]));
    stack = initStack(canvas, { layers, names: NAMES, labels, certs: $$('.certs li').length, reduced, mobile, theme: root.dataset.theme });
    lastEl = null; track();
    requestAnimationFrame(() => canvas.classList.add('on'));
  } catch (err) {
    console.warn('Pile 3D indisponible', err);
  }
}
if (document.readyState === 'complete') boot(); else addEventListener('load', boot);
track();
