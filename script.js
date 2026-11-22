/* =========================================================
   Хурцболдын пиксел портфолио — script.js
   1) Өрөө → доош гүйлгэхэд камер компьютер руу ойртоно (zoom)
   2) Компьютер дотор → пиксел шилжилттэй слайдууд, 3D carousel
   ========================================================= */

/* ---------- 1. ӨӨРИЙН МЭДЭЭЛЛЭЭ ЭНД СОЛИНО ---------- */
const ROLES = ['Full-stack хөгжүүлэгч', 'React дурлагч', 'Мобайл апп бүтээгч', 'Тоглоом сонирхогч'];

// img: 'images/zenflow.png' гэж өгвөл дэлгэцийн зураг гарна.
// Хоосон бол кодоор зурсан пиксел зураг гарна.
const PROJECTS = [
  {
    title: 'ZenFlow',
    desc: 'Йога, фитнес студийн гишүүнчлэл болон хичээлийн бүртгэлийн систем. Төлбөр, хуваарь, админ самбартай.',
    tags: ['React', 'Supabase', 'Vercel'],
    demo: '#',
    code: 'https://github.com/Khurtsa99/zenflow-studio',
    img: '',
    type: 'web',
    colors: ['#7fd1b9', '#2b6f5e', '#e8f6f1'],
  },
  {
    title: '50 сая-ийн уналт',
    desc: 'Алдарт телевизийн тоглоомын дүрмээр хийсэн нэг тоглогчтой асуулт хариултын мобайл апп.',
    tags: ['React Native', 'Expo', 'Supabase'],
    demo: '#',
    code: '',
    img: '',
    type: 'phone',
    colors: ['#ffcc4d', '#7b3fbf', '#2a1b4a'],
  },
  {
    title: 'Huns Bundle + Hurgelt',
    desc: 'Монгол хоолны багцын хүргэлтийн вэбсайтын прототип: найрлага тохируулах, долоо хоногийн төлөвлөгч, сагс.',
    tags: ['React', 'UI/UX', 'Прототип'],
    demo: '#',
    code: '',
    img: '',
    type: 'web',
    colors: ['#F47B20', '#183A32', '#F7F3EA'],
  },
  {
    title: 'StudyMate AI',
    desc: 'Оюутнуудад хичээлээ төлөвлөж, давтахад тусалдаг Android апп.',
    tags: ['React Native', 'TypeScript', 'Supabase'],
    demo: '#',
    code: '',
    img: '',
    type: 'phone',
    colors: ['#4da3ff', '#1f3c88', '#e6f0ff'],
  },
];

// «Миний тухай» хуудасны ур чадвар
const SKILL_GROUPS = [
  ['Сайн эзэмшсэн', 'HTML, CSS, JavaScript, React, Git'],
  ['Ашиглаж байсан', 'React Native, Expo, Supabase, Figma, Vercel'],
  ['Сурч байгаа', 'TypeScript, Python, Next.js'],
];

// «Хийх зүйлс» жагсаалт: true = хийж дууссан
const BUCKET = [
  ['Lorem ipsum dolor sit amet', true],
  ['Consectetur adipiscing elit', true],
  ['Sed do eiusmod tempor', true],
  ['Ut enim ad minim veniam', false],
  ['Quis nostrud exercitation', false],
  ['Duis aute irure dolor', false],
  ['Excepteur sint occaecat', false],
];

/* ---------- 2. Туслах функцууд ---------- */
const $ = (sel) => document.querySelector(sel);
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const now = () => performance.now();

// localStorage ажиллахгүй бол алдаа өгөхгүй, зүгээр алгасна
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* алгасна */ }
  },
};

/* ---------- 3. 8-bit дуу (Web Audio API, файлгүй) ---------- */
let audioCtx = null;
let muted = store.get('muted', false);

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
}

function tone(freq, dur, type = 'square', delay = 0, vol = 0.05, slideTo = null) {
  if (muted || !audioCtx) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

const sfx = {
  click: () => tone(520, 0.06, 'sine', 0, 0.03),
  found: () => tone(620, 0.12, 'sine', 0, 0.03),
  meow: () => tone(900, 0.35, 'sawtooth', 0, 0.04, 450),
  hit: () => tone(300, 0.08, 'triangle', 0, 0.04, 180),
  whoosh: () => tone(220, 0.5, 'sine', 0, 0.04, 660),
  back: () => tone(660, 0.45, 'sine', 0, 0.04, 220),
  slide: () => tone(440, 0.1, 'sine', 0, 0.025),
  achieve: () => {},
};

/* ---------- Арын хөгжим: кодоор үүсгэсэн тайван lofi ая (файлгүй) ---------- */
const BEAT = 60 / 72;                       // 72 BPM
const CHORDS = [                            // Cmaj7 → Am7 → Fmaj7 → G
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 392.0],
];
const MELODY = [523.25, 587.33, 659.25, 783.99, 880.0]; // пентатоник
const music = { on: false, timer: null, next: 0, step: 0, out: null };

function musicNote(freq, t, dur, vol, type) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(music.out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Ойрын 0.6 секундэд тоглох нотуудыг урьдчилан төлөвлөнө
function scheduleMusic() {
  while (music.next < audioCtx.currentTime + 0.6) {
    const t = music.next, s = music.step;
    const chord = CHORDS[Math.floor(s / 8) % 4];
    if (s % 8 === 0) chord.forEach((f) => musicNote(f / 2, t, BEAT * 4.2, 0.03, 'sine'));  // зөөлөн аккорд
    if (s % 2 === 0) musicNote(chord[(s / 2) % 4], t, BEAT * 1.2, 0.025, 'triangle');       // арпеджио
    if (Math.random() < 0.12) musicNote(MELODY[Math.floor(Math.random() * MELODY.length)], t, BEAT * 1.5, 0.015, 'sine');
    music.next += BEAT / 2;
    music.step++;
  }
}

function startMusic() {
  if (music.on || muted || !audioCtx) return;
  music.on = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1600;
  music.out = audioCtx.createGain();
  music.out.gain.setValueAtTime(0, audioCtx.currentTime);
  music.out.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 4);  // аажмаар чангарна
  music.out.connect(filter).connect(audioCtx.destination);
  music.next = audioCtx.currentTime + 0.1;
  music.timer = setInterval(scheduleMusic, 200);
}

function stopMusic() {
  if (!music.on) return;
  music.on = false;
  clearInterval(music.timer);
  const out = music.out;
  out.gain.cancelScheduledValues(audioCtx.currentTime);
  out.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
  setTimeout(() => out.disconnect(), 1500);
}

// Өөр таб руу шилжвэл хөгжмийг түр зогсооно
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopMusic(); else startMusic();
});

/* ---------- 4. Интро (том нэр + унах дүр) ---------- */
const intro = $('#intro');
let started = false;
// Нэрийн үсэг бүрийг тусад нь анимэйшн хийхийн тулд span-д хуваана
const isoName = $('#isoName');
isoName.innerHTML = [...isoName.textContent].map((ch, i) => `<span style="--i:${i}">${ch}</span>`).join('');

function finishIntro() {
  if (started) return;
  started = true;
  intro.classList.add('hide');
  measure();
  render();
  setTimeout(() => intro.remove(), 700);
}
intro.addEventListener('click', () => { initAudio(); finishIntro(); });
setTimeout(finishIntro, 3000);
// Хөтөч дуу тоглуулахын тулд хэрэглэгч ямар нэг зүйл дарсан байх ёстой
addEventListener('pointerdown', () => {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusic();
}, { once: true });

/* ---------- 5. Горим, дуу, цэс ---------- */
const root = document.documentElement;
const themeBtn = $('#themeBtn');
const soundBtn = $('#soundBtn');

function setTheme(theme) {
  const changed = root.dataset.theme !== theme;
  root.dataset.theme = theme;
  if (changed && typeof catReady !== 'undefined' && catReady) catReplan();   // муур өдөр/шөнөд тохируулна
}
// Хэрэглэгч өөрөө сольсон бол автомат горим зогсоно
// Горим: 'auto' = Улаанбаатарын цагаар, 'light' = үргэлж өдөр, 'dark' = үргэлж шөнө
let themeMode = 'auto';
const THEME_MODES = {
  auto: { icon: '🕐', label: 'Авто' },
  light: { icon: '☀', label: 'Light' },
  dark: { icon: '☾', label: 'Dark mode' },
};
function setThemeMode(m) {
  themeMode = m;
  $('#themeIcon').textContent = THEME_MODES[m].icon;
  $('#themeLabel').textContent = THEME_MODES[m].label;
  themeBtn.setAttribute('aria-label', `Горим: ${THEME_MODES[m].label}`);
  if (m === 'auto') { const { h } = ubNow(); setTheme(h >= 7 && h < 19 ? 'light' : 'dark'); }
  else setTheme(m);
}

/* ---------- Улаанбаатарын цаг: өдөр/шөнө, цас, ханын цаг ---------- */
function ubNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ulaanbaatar', hour: '2-digit', minute: '2-digit', month: 'numeric', hour12: false,
    }).formatToParts(new Date());
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    return { h: Number(p.hour) % 24, m: Number(p.minute), month: Number(p.month) };
  } catch (e) {
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes(), month: d.getMonth() + 1 };
  }
}
const pad2 = (n) => String(n).padStart(2, '0');

function syncWithUB() {
  const { h, m, month } = ubNow();
  if (themeMode === 'auto') setTheme(h >= 7 && h < 19 ? 'light' : 'dark');          // 07–19 өдөр, бусад үед шөнө
  document.body.classList.toggle('snowy', [11, 12, 1, 2, 3].includes(month)); // өвлийн саруудад цас орно
  // Ханын цагийн зүү
  const hourAngle = ((h % 12) + m / 60) * 30, minAngle = m * 6;
  document.getElementById('clockH').setAttribute('transform', `rotate(${hourAngle} 111 16)`);
  document.getElementById('clockM').setAttribute('transform', `rotate(${minAngle} 111 16)`);
}
syncWithUB();
setInterval(syncWithUB, 20000);

// Цонхон дахь цасан ширхгүүдийг санамсаргүй байрлалаар үүсгэнэ
(function makeSnow() {
  const snow = document.getElementById('snow');
  const NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 14; i++) {
    const f = document.createElementNS(NS, 'rect');
    f.setAttribute('class', 'flake');
    f.setAttribute('x', (12 + Math.random() * 36).toFixed(1));
    f.setAttribute('y', (8 + Math.random() * 22).toFixed(1));
    f.setAttribute('width', '.8');
    f.setAttribute('height', '.8');
    f.style.animationDuration = (6 + Math.random() * 4).toFixed(2) + 's';
    f.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
    snow.append(f);
  }
})();
// Товч: Авто → Light → Dark mode → Авто ...
themeBtn.addEventListener('click', () => {
  const order = ['auto', 'light', 'dark'];
  setThemeMode(order[(order.indexOf(themeMode) + 1) % order.length]);
  sfx.click();
});

function renderSound() { soundBtn.classList.toggle('muted', muted); }
renderSound();
soundBtn.addEventListener('click', () => {
  initAudio();
  muted = !muted;
  store.set('muted', muted);
  renderSound();
  if (muted) stopMusic(); else { sfx.click(); startMusic(); }
});

const navLinks = $('#navLinks');
$('#menuBtn').addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('#navLinks a, .js-slide').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.classList.remove('open');
    if (a.dataset.page === 'about') openAbout();
    else { closeAbout(); goTo(Number(a.dataset.slide)); }
  });
});
$('#logo').addEventListener('click', (e) => { e.preventDefault(); closeAbout(); exitOS(); });

/* ---------- «Миний тухай» тусдаа хуудас ---------- */
const aboutPage = $('#aboutPage');
let aboutOpen = false;

function setMenuActive(key) {
  navLinks.querySelectorAll('a').forEach((a) => {
    const k = a.dataset.page || a.dataset.slide;
    a.classList.toggle('active', key !== null && String(k) === String(key));
  });
}

function openAbout(section) {
  if (aboutOpen) return;
  aboutOpen = true;
  if (playing) endGame();
  hideBubble();
  aboutPage.scrollTop = 0;
  revealStatement();
  aboutPage.classList.add('show');
  if (section === 'skills') setTimeout(() => $('#skillGroups').closest('section').scrollIntoView({ behavior: 'smooth', block: 'center' }), 450);
  else statementWords.slice(0, 1).forEach((w) => w.classList.add('on'));   // эхний үг шууд тодорно
  aboutPage.setAttribute('aria-hidden', 'false');
  document.body.classList.add('about-open');
  setMenuActive('about');
  sfx.click();
}

function closeAbout() {
  if (!aboutOpen) return;
  aboutOpen = false;
  aboutPage.classList.remove('show');
  aboutPage.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('about-open');
  setMenuActive(mode === 'os' ? current : null);
}
$('#aboutBack').addEventListener('click', () => { closeAbout(); exitOS(); });

// «Миний тухай»: гүйлгэх тусам танилцуулгын үгс нэг нэгээрээ тодорно
const statement = $('#statement');
statement.innerHTML = statement.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
const statementWords = [...statement.querySelectorAll('.w')];
const statementBox = $('#apStatement');
function revealStatement() {
  const range = statementBox.offsetHeight - aboutPage.clientHeight;
  const progress = clamp(aboutPage.scrollTop / (range * 0.85));
  const lit = Math.round(progress * statementWords.length);
  statementWords.forEach((w, i) => w.classList.toggle('on', i < lit));
  document.querySelector('.statement-hint').style.opacity = progress > 0.05 ? 0 : 1;
}
aboutPage.addEventListener('scroll', revealStatement, { passive: true });
$('#bioContact').addEventListener('click', (e) => { e.preventDefault(); closeAbout(); goTo(2); });

/* ---------- 6. Бичиж буй мэт эффект ---------- */
const typed = $('#typed');
let roleIndex = 0, charIndex = 0, deleting = false;
function typeLoop() {
  const word = ROLES[roleIndex];
  typed.textContent = word.slice(0, charIndex);
  if (!deleting && charIndex < word.length) { charIndex++; setTimeout(typeLoop, 70); }
  else if (!deleting) { deleting = true; setTimeout(typeLoop, 1600); }
  else if (charIndex > 0) { charIndex--; setTimeout(typeLoop, 35); }
  else { deleting = false; roleIndex = (roleIndex + 1) % ROLES.length; setTimeout(typeLoop, 300); }
}
typed.textContent = ROLES[0];   // хөдөлгөөнгүй, тайван

/* =========================================================
   7. ZOOM — камер компьютерын дэлгэц рүү ойртох
   ========================================================= */
const roomWrap = $('#roomWrap');
const roomSvg = $('#room');
const fadeEls = [...document.querySelectorAll('.fade-out')];
const guide = $('#guide');
const flash = $('#flash');
const os = $('#os');

let zoom = 0;          // одоогийн утга (0 = өрөө, 1 = дэлгэц дотор)
let zoomTarget = 0;    // хүрэх ёстой утга
let mode = 'room';     // 'room' эсвэл 'os'
let lockUntil = 0;     // хэт хурдан дахин гүйлгэхээс сэргийлэх
let pendingSlide = 0;  // орох үед нээх слайд
let geo = null;        // хэмжилтүүд

// Өргөн дэлгэцэнд өрөөг бүтэн дүүргэнэ, босоо (утас) дэлгэцэнд доор нь бүтнээр харуулна
function setAspect() {
  const ratio = innerWidth / innerHeight;
  let box, fit;
  if (ratio < 1.1) { box = '0 4 160 96'; fit = 'xMidYMax meet'; }         // утас: бүтнээр
  else if (ratio < 1.65) { box = '0 0 160 100'; fit = 'xMidYMax meet'; }  // дунд дэлгэц: тайралгүй бүтнээр
  else { box = '-40 0 240 100'; fit = 'xMidYMax slice'; }                 // өргөн дэлгэц: бүтэн дүүргэнэ
  roomSvg.setAttribute('viewBox', box);
  roomSvg.setAttribute('preserveAspectRatio', fit);
  // Босоо дэлгэцэнд танилцуулгын дүрийг өрөөний дээр гаргана (өрөөг халхлахгүй)
  const [, , vw, vh] = box.split(' ').map(Number);
  const roomH = Math.min(innerHeight, (innerWidth * vh) / vw);
  document.documentElement.style.setProperty('--guide-bottom', ratio < 1.1 ? `${roomH + 8}px` : '16px');
}

// Компьютерын дэлгэцийн байрлалыг transform-гүйгээр хэмжинэ
function measure() {
  setAspect();
  const prev = roomWrap.style.transform;
  roomWrap.style.transform = 'none';
  const wrap = roomWrap.getBoundingClientRect();
  const scr = $('#pcScreen').getBoundingClientRect();
  roomWrap.style.transform = prev;
  geo = {
    left: wrap.left,
    top: wrap.top,
    cx: scr.left - wrap.left + scr.width / 2,   // дэлгэцийн төв
    cy: scr.top - wrap.top + scr.height / 2,
    maxScale: Math.max(innerWidth / scr.width, innerHeight / scr.height) * 1.15,
  };
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// zoom-ийн утгаар өрөөг томруулж, дэлгэцийн төвийг цонхны төв рүү шилжүүлнэ
function render() {
  if (!geo) measure();
  const e = easeInOut(zoom);
  const s = 1 + (geo.maxScale - 1) * e;
  const startX = geo.left + geo.cx, startY = geo.top + geo.cy;
  const px = startX + (innerWidth / 2 - startX) * e;
  const py = startY + (innerHeight / 2 - startY) * e;
  const tx = px - geo.left - s * geo.cx;
  const ty = py - geo.top - s * geo.cy;
  roomWrap.style.transform = zoom < 0.001 ? '' : `translate(${tx}px, ${ty}px) scale(${s})`;

  const fade = clamp(zoom * 3);
  fadeEls.forEach((el) => {
    el.style.opacity = 1 - fade;
    el.style.visibility = fade >= 1 ? 'hidden' : '';
  });
  guide.style.transform = `translateY(${fade * 40}px)`;
  flash.style.opacity = clamp((zoom - 0.8) / 0.2);
  document.body.classList.toggle('zooming', zoom > 0.01);
  if (zoom > 0.02) { hideBubble(); tip.style.display = 'none'; }
}

function loop() {
  const diff = zoomTarget - zoom;
  if (Math.abs(diff) > 0.0008) { zoom += diff * 0.09; render(); }
  else if (zoom !== zoomTarget) { zoom = zoomTarget; render(); }
  if (mode === 'room' && zoomTarget === 1 && zoom > 0.99) enterOS();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Гүйлгэлт зогсвол бүрэн орох эсвэл буцах
let snapTimer;
function snap() {
  if (mode !== 'room') return;
  zoomTarget = zoomTarget > 0.15 ? 1 : 0;
}
function scheduleSnap() { clearTimeout(snapTimer); snapTimer = setTimeout(snap, 250); }

function enterOS() {
  mode = 'os';
  lockUntil = now() + 700;
  os.classList.add('show');
  os.setAttribute('aria-hidden', 'false');
  document.body.classList.add('in-os');   // цэс зөвхөн компьютер дотор харагдана
  sfx.whoosh();
  showSlide(pendingSlide);
}

function exitOS() {
  if (mode !== 'os') { zoomTarget = 0; return; }
  mode = 'room';
  lockUntil = now() + 700;
  os.classList.remove('show');
  os.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('in-os');
  navLinks.classList.remove('open');
  if (playing) endGame();
  sfx.back();
  zoomTarget = 0;
  setMenuActive(null);
  document.body.classList.remove('works-active');
}

// Цэс эсвэл товчоос тодорхой слайд руу очих
function goTo(index) {
  pendingSlide = index;
  if (mode === 'os') changeSlide(index);
  else { zoomTarget = 1; }
}
$('#exitBtn').addEventListener('click', exitOS);

addEventListener('resize', () => { measure(); render(); layoutCarousel(); });
if (document.fonts) document.fonts.ready.then(() => { measure(); render(); });

/* =========================================================
   8. СЛАЙДУУД — компьютер доторх хэсгүүд
   ========================================================= */
const slides = [...document.querySelectorAll('.slide')];
const dockBtns = [...document.querySelectorAll('#dock button')];
const osPath = $('#osPath');
const wipe = $('#wipe');
let current = -1;
let wiping = false;

// Пиксел шилжилтийн нүднүүд (санамсаргүй хугацаагаар гарч ирнэ)
for (let i = 0; i < 160; i++) {
  const cell = document.createElement('i');
  cell.style.setProperty('--d', (Math.random() * 0.25).toFixed(3) + 's');
  wipe.append(cell);
}

function showSlide(index) {
  if (slides[current] && slides[current].id === 'playground' && index !== current && playing) endGame();
  current = index;
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  const inner = slides[index].querySelector('.slide-inner');
  if (inner) inner.scrollTop = 0;
  if (index === 0) requestAnimationFrame(layoutCarousel); // харагдсаны дараа хэмжээг тооцно
  dockBtns.forEach((b) => b.classList.toggle('active', b.dataset.slide === String(index)));
  setMenuActive(index);
  document.body.classList.toggle('works-active', slides[index].id === 'projects');
  osPath.textContent = `C:\\ХУРЦБОЛД\\${slides[index].dataset.title}`;
  pendingSlide = index;
  if (slides[index].id === 'terminal' && matchMedia('(hover: hover)').matches) setTimeout(() => termIn.focus(), 450);
}

function changeSlide(index) {
  if (index === current || wiping || index < 0 || index >= slides.length) return;
  wiping = true;
  sfx.slide();
  const stage = document.querySelector('.os-stage');
  stage.classList.add('fading');                       // зөөлөн уусах шилжилт
  setTimeout(() => { showSlide(index); stage.classList.remove('fading'); }, 260);
  setTimeout(() => { wiping = false; }, 600);
}
function nextSlide() { changeSlide(current + 1); }
function prevSlide() { if (current === 0) exitOS(); else changeSlide(current - 1); }

dockBtns.forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.page === 'about') openAbout(); else changeSlide(Number(b.dataset.slide));
}));

// Цаг
function tick() {
  const d = new Date();
  $('#osClock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
tick();
setInterval(tick, 10000);

/* ---------- 9. Хулгана, touch, гарын удирдлага ---------- */
function activeInner() { return mode === 'os' && slides[current] ? slides[current].querySelector('.slide-inner') : null; }
// Слайд дотроо гүйлгэх зай үлдсэн эсэх (жижиг дэлгэцэнд)
function canScroll(el, dir) {
  if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
  return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 0;
}

addEventListener('wheel', (e) => {
  if (!started || aboutOpen) return;   // «Миний тухай» хуудас энгийнээр гүйлгэгдэнэ
  const k = e.deltaMode === 1 ? 16 : 1;
  const dy = e.deltaY * k, dx = e.deltaX * k;

  if (mode === 'room') {
    e.preventDefault();
    if (now() < lockUntil) return;
    zoomTarget = clamp(zoomTarget + dy * 0.0025);
    scheduleSnap();
    return;
  }

  const termBox = e.target.closest && e.target.closest('.term-out');
  if (termBox && canScroll(termBox, dy)) return;                        // терминалын бичвэр гүйлгэх
  if (canScroll(activeInner(), dy) && Math.abs(dy) > Math.abs(dx)) return; // слайд доторх scroll
  e.preventDefault();
  if (now() < lockUntil) return;
  if (current === 0 && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
    dx > 0 ? carNext() : carPrev();
    lockUntil = now() + 450;
    return;
  }
  if (Math.abs(dy) < 15) return;
  // Бүтээлүүд дээр гүйлгэхэд эхлээд төсөл (суваг) солигдоно
  if (stepProjects(dy)) { lockUntil = now() + 750; return; }
  dy > 0 ? nextSlide() : prevSlide();
  lockUntil = now() + 900;
}, { passive: false });

// Бүтээлүүд хэсэгт байвал дараагийн/өмнөх төсөл рүү шилжинэ. Шилжсэн бол true
function stepProjects(dir) {
  if (current !== 0) return false;
  if (dir > 0 && carIndex < cards.length - 1) { carNext(); return true; }
  if (dir < 0 && carIndex > 0) { carPrev(); return true; }
  return false;
}

let touchY = null, touchX = null, touchZoom = 0, touchCanScroll = { up: false, down: false };
addEventListener('touchstart', (e) => {
  touchY = e.touches[0].clientY;
  touchX = e.touches[0].clientX;
  touchZoom = zoomTarget;
  const inner = activeInner();
  touchCanScroll = { up: canScroll(inner, -1), down: canScroll(inner, 1) };
}, { passive: true });

addEventListener('touchmove', (e) => {
  if (touchY === null || !started || aboutOpen) return;
  if (mode === 'room') {
    e.preventDefault();
    zoomTarget = clamp(touchZoom + (touchY - e.touches[0].clientY) * 0.004);
  }
}, { passive: false });

addEventListener('touchend', (e) => {
  if (touchY === null || !started || aboutOpen) { touchY = null; return; }
  const t = e.changedTouches[0];
  const dy = touchY - t.clientY, dx = touchX - t.clientX;
  touchY = null;
  if (mode === 'room') { snap(); return; }
  if (Math.abs(dy) < 60 || Math.abs(dx) > Math.abs(dy) || now() < lockUntil) return;
  if ((dy > 0 && touchCanScroll.down) || (dy < 0 && touchCanScroll.up)) return;
  if (stepProjects(dy)) { lockUntil = now() + 600; return; }
  dy > 0 ? nextSlide() : prevSlide();
  lockUntil = now() + 700;
});

const isTyping = (e) => e.target && e.target.matches && e.target.matches('input, textarea');

addEventListener('keydown', (e) => {
  if (!started) return;
  if (isTyping(e)) { if (e.key === 'Escape') e.target.blur(); return; }  // терминалд бичиж байна
  const key = e.key;
  const onBody = e.target === document.body;
  if (key === 'Escape' && document.body.classList.contains('party')) return;  // Esc эхлээд солонго горимыг унтраана
  if (aboutOpen) { if (key === 'Escape') closeAbout(); return; }
  if (mode === 'room') {
    if (['ArrowDown', 'PageDown'].includes(key) || (key === ' ' && onBody)) { e.preventDefault(); goTo(pendingSlide); }
    return;
  }
  if (now() < lockUntil) return;
  if (key === 'ArrowDown' || key === 'PageDown') { e.preventDefault(); if (!stepProjects(1)) nextSlide(); lockUntil = now() + 500; }
  else if (key === 'ArrowUp' || key === 'PageUp') { e.preventDefault(); if (!stepProjects(-1)) prevSlide(); lockUntil = now() + 500; }
  else if (key === 'Escape') exitOS();
  else if (current === 0 && key === 'ArrowRight') carNext();
  else if (current === 0 && key === 'ArrowLeft') carPrev();
});

/* =========================================================
   10. ПИКСЕЛ ӨРӨӨНИЙ ХАРИЛЦАН ҮЙЛДЭЛ
   ========================================================= */
const hots = [...document.querySelectorAll('#room .hot')];
const found = new Set();
const foundCount = $('#foundCount');
const bubbleEl = $('#bubble');
const tip = $('#tip');
let bubbleTimer;

function updateHUD() { foundCount.textContent = `${found.size}/${hots.length}`; }
updateHUD();

function bubble(el, text, action) {
  const r = el.getBoundingClientRect();
  const w = roomWrap.getBoundingClientRect();
  const x = clamp(((r.left + r.width / 2 - w.left) / w.width) * 100, 12, 88);
  // Дээд хэсэгт байгаа зүйлийн бөмбөлгийг доор нь гаргана (профайл карт, цэсэнд халхлагдахгүй)
  const topPct = ((r.top - w.top) / w.height) * 100;
  const below = r.top < 200;
  bubbleEl.classList.toggle('below', below);
  bubbleEl.style.left = x + '%';
  bubbleEl.style.top = (below ? ((r.bottom - w.top) / w.height) * 100 : Math.max(12, topPct)) + '%';
  bubbleEl.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = text;
  bubbleEl.append(span);

  if (action) {
    const btn = document.createElement('button');
    btn.className = 'bubble-go';
    btn.textContent = 'Орох →';
    btn.addEventListener('click', () => { hideBubble(); action(); });
    bubbleEl.append(btn);
  }
  bubbleEl.classList.remove('show');
  void bubbleEl.offsetWidth;
  bubbleEl.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, action ? 5000 : 2600);
}
function hideBubble() { bubbleEl.classList.remove('show'); }

// CSS анимэйшныг дахин эхлүүлэх
function replay(node) {
  node.classList.remove('go');
  void node.getBoundingClientRect();
  node.classList.add('go');
}
function shootStar() { replay($('#shoot')); }

const ACTIONS = {
  cat: (el) => {
    sfx.meow();
    if (cat.pose === 'sleep') { catWake(); bubble(el, 'Мяау! Сэрээчихлээ 😾'); return; }
    bubble(el, 'Мяау! 🐾');
    el.classList.remove('jump');
    void el.getBoundingClientRect();
    el.classList.add('jump');
  },
  clock: (el) => {
    const { h, m } = ubNow();
    bubble(el, `Улаанбаатарт одоо ${pad2(h)}:${pad2(m)} ${h >= 7 && h < 19 ? '☀️' : '🌙'}`);
  },
  window: (el) => {
    // Шөнө од харвана, өдөр (нар жаргах үед) шувууд нисэнэ
    if (root.dataset.theme === 'dark') { shootStar(); bubble(el, 'Од харвалаа ✨ Хүслээ шивнээрэй!'); }
    else { replay($('#bird')); bubble(el, 'Шувууд нисэж өнгөрлөө 🐦'); }
  },
  me: (el) => bubble(el, 'Сайн уу! 👋 Компьютер руу минь ороод үзээрэй'),
  door: (el) => enterDoor(el),
};

/* ---------- Амьд муур ----------
   Өдөр: алхаж, сууж, ханан дээрх шатаар үсэрч тоглоно.
   Шөнө (шөнийн горимд): шатнаас бууж, орондоо очиж унтана.
   Муурын хөдөлгөөнийг «дараалсан үйлдэл» (queue) болгон төлөвлөнө:
   walk = шалаар алхах, jump = үсрэх, wait = суух/унтах. */
const catPos = document.getElementById('catPos');
const catEl = document.querySelector('#room .cat');
const CAT_CENTER = 25.5;                  // муурын төв (SVG координат)
const FLOOR_MIN = 10, FLOOR_MAX = 80;     // шалаар алхах хязгаар
const STEPS = [                           // ханан дээрх 4 шат (доороос дээш)
  { x: 104.5, y: -26 }, { x: 120.5, y: -40 }, { x: 104.5, y: -54 }, { x: 120.5, y: -68 },
];
const LAUNCH_X = 92;                      // шат руу үсрэх газар
const BED_X = 122.5;                      // орны байрлал
const cat = { x: 60, y: 0, dir: 1, level: 0, atBed: false, pose: 'sit', queue: [], act: null };
var catReady = false;
const isNight = () => root.dataset.theme === 'dark';

function catRender() {
  // зүүн тийш харахдаа толины тусгал шиг эргэнэ
  catPos.setAttribute('transform', cat.dir === 1
    ? `translate(${cat.x.toFixed(2)},${cat.y.toFixed(2)})`
    : `translate(${(cat.x + CAT_CENTER * 2).toFixed(2)},${cat.y.toFixed(2)}) scale(-1,1)`);
}

function setPose(pose) {
  cat.pose = pose;
  catEl.classList.toggle('walking', pose === 'walk');
  catEl.classList.toggle('sleeping', pose === 'sleep');
}

// Одоо байгаа шатнаас шал руу нэг нэгээр буух
function descendPlan() {
  const plan = [];
  for (let l = cat.level - 1; l >= 1; l--) plan.push({ type: 'jump', ...STEPS[l - 1], level: l }, { type: 'wait', ms: 350 });
  if (cat.level > 0) plan.push({ type: 'jump', x: LAUNCH_X - 6, y: 0, level: 0 });
  return plan;
}

// Дараагийн хийх зүйлсийг шийднэ
function planNext() {
  const q = cat.queue;
  if (isNight()) {
    if (cat.atBed) { q.push({ type: 'wait', ms: 8000, pose: 'sleep' }); return; }
    q.push(...descendPlan(),
      { type: 'walk', x: BED_X - 16 },
      { type: 'jump', x: BED_X, y: 0, level: 0, bed: true },
      { type: 'wait', ms: 8000, pose: 'sleep' });
    return;
  }
  if (cat.atBed) q.push({ type: 'jump', x: BED_X - 18, y: 0, level: 0, bed: false });  // өглөө орноосоо гарна
  const r = Math.random();
  if (r < 0.4) {                                             // алхаад суух
    q.push(...descendPlan(),
      { type: 'walk', x: FLOOR_MIN + Math.random() * (FLOOR_MAX - FLOOR_MIN) },
      { type: 'wait', ms: 4000 + Math.random() * 4000, pose: 'sit' });
  } else if (r < 0.8) {                                      // шатаар тоглох
    q.push(...descendPlan(), { type: 'walk', x: LAUNCH_X });
    STEPS.forEach((s, i) => q.push(
      { type: 'jump', x: s.x, y: s.y, level: i + 1 },
      { type: 'wait', ms: i === 3 ? 3500 + Math.random() * 3000 : 700, pose: 'sit' }));
    [3, 2, 1].forEach((l) => q.push({ type: 'jump', ...STEPS[l - 1], level: l }, { type: 'wait', ms: 400, pose: 'sit' }));
    q.push({ type: 'jump', x: LAUNCH_X - 8, y: 0, level: 0 }, { type: 'wait', ms: 3000, pose: 'sit' });
  } else {
    q.push({ type: 'wait', ms: 5000, pose: 'sit' });          // зүгээр суух
  }
}

function startAct(a) {
  const t = performance.now();
  if (a.type === 'walk') {
    setPose('walk');
    if (a.x !== cat.x) cat.dir = a.x > cat.x ? 1 : -1;
  } else if (a.type === 'jump') {
    setPose('sit');
    Object.assign(a, { t0: t, dur: 450, x0: cat.x, y0: cat.y });
    if (Math.abs(a.x - cat.x) > 0.5) cat.dir = a.x > cat.x ? 1 : -1;
  } else {
    setPose(a.pose || 'sit');
    a.until = t + a.ms;
  }
}

function catTick() {
  if (mode !== 'room' || document.hidden) return;
  if (!cat.act) {
    if (!cat.queue.length) planNext();
    cat.act = cat.queue.shift();
    startAct(cat.act);
  }
  const a = cat.act, t = performance.now();
  if (a.type === 'walk') {
    const d = a.x - cat.x;
    if (Math.abs(d) <= 0.16) { cat.x = a.x; cat.act = null; }
    else cat.x += 0.16 * Math.sign(d);
  } else if (a.type === 'jump') {
    // нумарсан (парабол) зам
    const p = Math.min(1, (t - a.t0) / a.dur);
    const arc = 6 + Math.abs(a.y - a.y0) * 0.25;
    cat.x = a.x0 + (a.x - a.x0) * p;
    cat.y = a.y0 + (a.y - a.y0) * p - arc * 4 * p * (1 - p);
    if (p >= 1) { cat.level = a.level; if ('bed' in a) cat.atBed = a.bed; cat.act = null; }
  } else if (t >= a.until) {
    cat.act = null;
  }
  catRender();
}

// Өдөр/шөнө солигдоход эсвэл дарж сэрээхэд шинээр төлөвлөнө
function catReplan() {
  if (cat.act && cat.act.type === 'wait') cat.act = null;   // үсэрч байхад тасалдуулахгүй
  cat.queue = [];
}
function catWake() {
  catReplan();
  cat.queue.push({ type: 'wait', ms: 3500, pose: 'sit' });
}

catRender();
catReady = true;
setInterval(catTick, 50);

// Нүд нь хулганы заагчийг дагана
addEventListener('mousemove', (e) => {
  if (mode !== 'room' || cat.pose === 'sleep') return;
  const r = catEl.getBoundingClientRect();
  const dx = clamp((e.clientX - (r.left + r.width / 2)) / 250, -0.6, 0.6) * cat.dir;
  const dy = clamp((e.clientY - (r.top + r.height / 2)) / 250, -0.4, 0.4);
  catEl.querySelectorAll('.eye').forEach((eye) => { eye.style.transform = `translate(${dx}px, ${dy}px)`; });
});

// Хаалга онгойж, гэрэл тусаад «Миний тухай» хуудас нээгдэнэ
let doorBusy = false;
function enterDoor(el) {
  if (doorBusy) return;
  doorBusy = true;
  hideBubble();
  el.classList.add('open');
  tone(160, 0.5, 'sawtooth', 0, 0.025, 90);            // хаалганы шаржигнах чимээ
  const r = el.getBoundingClientRect();
  const flashEl = $('#doorFlash');
  flashEl.style.setProperty('--fx', `${r.left + r.width / 2}px`);
  flashEl.style.setProperty('--fy', `${r.top + r.height / 2}px`);
  setTimeout(() => flashEl.classList.add('on'), 380);
  setTimeout(() => { openAbout(); flashEl.classList.remove('on'); }, 800);
  setTimeout(() => { el.classList.remove('open'); doorBusy = false; }, 1600);
}

function activate(el) {
  if (mode !== 'room' || zoom > 0.05) return;
  const id = el.dataset.id;
  const isNew = !found.has(id);
  found.add(id);
  el.classList.add('found');
  updateHUD();
  isNew ? sfx.found() : sfx.click();

  if (ACTIONS[id]) ACTIONS[id](el);
  else bubble(el, el.dataset.label, () => goTo(Number(el.dataset.slide)));

  if (found.size === hots.length) unlock('room');
}

hots.forEach((el) => {
  el.addEventListener('click', () => { tip.style.display = 'none'; activate(el); });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); activate(el); }
  });
  el.addEventListener('mouseenter', () => { tip.textContent = el.dataset.label; tip.style.display = 'block'; });
  el.addEventListener('mousemove', (e) => { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 14 + 'px'; });
  el.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
});

/* ---------- Зүүн доод булангийн дүр: дарахад өөр өөр үг хэлнэ ---------- */
const GUIDE_LINES = [
  'Кодоор хүмүүсийн өдөр тутмыг арай хялбар, арай хөгжилтэй болгох зүйлс бүтээдэг. Доош гүйлгэж компьютер дотор минь бүтээлүүдийг үзээрэй, эсвэл хананд байгаа <b>хаалгаар</b> орж надтай танилцаарай 🚪',
  'Энэ өрөө Улаанбаатарын цагтай уялдана: өдөр нь өдөр, шөнө нь шөнө. Өвөл цонхоор цас орно ❄️',
  'Компьютер дотор терминал бий. <b>help</b> гэж бичээд үзээрэй ⌨️',
  'Өрөөн доторх зүйлс дээр хулганаа аваачаад дараад үзээрэй. Ихэнх нь нууцтай 🔍',
  'Миний муур өдөр ханан дээрх шатаар тоглож, шөнө орондоо унтдаг. Dark mode асаагаад үзээрэй 🐱',
  'Компьютер дотор жижиг тоглоом бий. Рекордыг минь эвдэж чадах уу? 🕹️',
  'Нууц: гар дээрээ «hello» гэж бичээд үз 👀',
];
let guideLine = 0;
// Танилцуулгын бөмбөлөг 10 секундийн дараа өөрөө хураагдана (дүр дээр дарвал дахин нээгдэнэ)
setTimeout(() => guide.classList.add('closed'), 13000);
$('#guideClose').addEventListener('click', (e) => { e.stopPropagation(); guide.classList.add('closed'); sfx.click(); });
$('#guideGuy').addEventListener('click', () => {
  if (guide.classList.contains('closed')) { guide.classList.remove('closed'); sfx.click(); return; }  // хаасан бол дахин нээнэ
  guideLine = (guideLine + 1) % GUIDE_LINES.length;
  $('#guideText').innerHTML = GUIDE_LINES[guideLine];
  sfx.click();
});

/* ---------- 11. Амжилт (achievement) ---------- */
const ACHIEVEMENTS = {
  room: ['Өрөөний мастер', 'Өрөөн доторх бүх зүйлийг олж үзлээ!'],
  secret: ['Нууц код', 'Солонго горим асав! Дахин «hello» эсвэл Esc дарвал буцна 😎'],
  bug: ['Алдаа агнуурчин', 'Нэг тоглолтод 15+ алдаа барилаа'],
};
const unlocked = new Set();

function unlock(key) {
  if (unlocked.has(key)) return;
  unlocked.add(key);
  // Тайван горим: амжилтын мэдэгдэл, конфетти гаргахгүй
  if (key === 'secret') showToast('🌈 СОЛОНГО ГОРИМ', 'Асаалаа', 'Дахин «hello» эсвэл Esc дарвал буцна');
}

function showToast(label, title, text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<small>${label}</small><b>${title}</b><p>${text}</p>`;
  $('#toasts').append(t);
  setTimeout(() => t.classList.add('out'), 3200);
  setTimeout(() => t.remove(), 3600);
}

function confetti() {
  const colors = ['#ff6b9a', '#ffcc4d', '#4da3ff', '#5ec27a', '#a77bdb'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.5 + Math.random() * 1.5 + 's';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.append(p);
    setTimeout(() => p.remove(), 3600);
  }
}

// Нууц үг: гар дээр «hello» гэж бичихэд дэлгэц солонгорно
let typedKeys = '';
addEventListener('keydown', (e) => {
  if (isTyping(e)) return;
  if (e.key === 'Escape' && document.body.classList.contains('party')) { setParty(false); return; }
  if (e.key.length !== 1) return;
  typedKeys = (typedKeys + e.key.toLowerCase()).slice(-5);
  if (typedKeys === 'hello') { typedKeys = ''; setParty(!document.body.classList.contains('party')); }
});

function setParty(on) {
  document.body.classList.toggle('party', on);
  if (on) {
    if (unlocked.has('secret')) showToast('🌈 СОЛОНГО ГОРИМ', 'Асаалаа', 'Дахин «hello» гэж бичвэл эсвэл Esc дарвал буцна');
    unlock('secret');
  } else {
    sfx.click();
  }
}
$('#partyBadge').addEventListener('click', () => setParty(false));

/* =========================================================
   12. 3D CAROUSEL — бүтээлүүд
   ========================================================= */
// '#' эсвэл хоосон бол жинхэнэ холбоос биш
const isLink = (url) => Boolean(url) && url !== '#';

function drawThumb(canvas, p) {
  const c = canvas.getContext('2d');
  const [main, dark, bg] = p.colors;
  c.fillStyle = bg; c.fillRect(0, 0, 64, 48);
  c.translate(0, 6);   // 4:3 дэлгэцийн голд байрлуулна
  if (p.type === 'phone') {
    c.fillStyle = dark; c.fillRect(6, 8, 4, 4); c.fillRect(52, 24, 5, 5);
    c.fillStyle = main; c.fillRect(10, 26, 3, 3); c.fillRect(50, 7, 3, 3);
    c.fillStyle = '#1b1b2f'; c.fillRect(24, 2, 16, 32);
    c.fillStyle = main; c.fillRect(26, 5, 12, 24);
    c.fillStyle = dark; c.fillRect(28, 8, 8, 3);
    for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? dark : '#fff'; c.fillRect(28, 14 + i * 5, 8, 3); }
    c.fillStyle = '#fff'; c.fillRect(31, 31, 2, 1);
  } else {
    c.fillStyle = '#1b1b2f'; c.fillRect(6, 3, 52, 30);
    c.fillStyle = dark; c.fillRect(7, 4, 50, 3);
    c.fillStyle = '#ff6b9a'; c.fillRect(8, 5, 1, 1);
    c.fillStyle = '#ffcc4d'; c.fillRect(10, 5, 1, 1);
    c.fillStyle = '#5ec27a'; c.fillRect(12, 5, 1, 1);
    c.fillStyle = '#fff'; c.fillRect(7, 7, 50, 25);
    c.fillStyle = main; c.fillRect(10, 10, 20, 8);
    c.fillStyle = dark; c.fillRect(33, 11, 20, 2); c.fillRect(33, 15, 13, 2);
    [10, 25, 40].forEach((x, i) => { c.fillStyle = i === 1 ? dark : main; c.fillRect(x, 21, 13, 8); });
  }
}

const carousel = $('#carousel');
const carCount = $('#carCount');
const cards = [];
let carIndex = 0;
let dragStartX = null, dragged = false;

// Зурагтын шуугианы зургийг нэг удаа үүсгээд CSS-д өгнө
(function makeNoise() {
  const cv = document.createElement('canvas');
  cv.width = 160; cv.height = 120;
  const cx = cv.getContext('2d');
  const img = cx.createImageData(160, 120);
  for (let k = 0; k < img.data.length; k += 4) {
    const v = Math.random() * 255;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = v;
    img.data[k + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--noise', `url(${cv.toDataURL()})`);
})();

PROJECTS.forEach((p, i) => {
  const card = document.createElement('article');
  card.className = 'ccard tv';
  card.setAttribute('aria-label', p.title);
  const media = p.img
    ? `<img src="${p.img}" alt="${p.title} төслийн зураг">`
    : '<canvas width="64" height="48" aria-hidden="true"></canvas>';
  card.innerHTML = `<div class="tv-screen">${media}</div>`;
  // Хажуугийн зурагт дээр дарвал төв рүү гаргана
  card.addEventListener('click', (e) => {
    if (dragged) { e.preventDefault(); return; }
    if (i !== carIndex) { carIndex = i; layoutCarousel(); channelSound(); }
  }, true);
  carousel.append(card);
  cards.push(card);
  if (!p.img) drawThumb(card.querySelector('canvas'), p);
});

// Голд байгаа төслийн мэдээллийг доор харуулна
function showTvInfo() {
  const p = PROJECTS[carIndex];
  $('#tvTitle').textContent = p.title;
  $('#tvTitle').classList.toggle('long', p.title.length > 12);   // урт нэрийг жижигрүүлнэ
  $('#tvDesc').textContent = p.desc;
  $('#tvTags').innerHTML = p.tags.map((t) => `<li>${t}</li>`).join('');
  $('#tvLinks').innerHTML =
    (isLink(p.demo) ? `<a href="${p.demo}" target="_blank" rel="noopener">Үзэх ↗</a>` : '') +
    (isLink(p.code) ? `<a href="${p.code}" target="_blank" rel="noopener">Код ↗</a>` : '') +
    (!isLink(p.demo) && !isLink(p.code) ? '<span class="link-soon">Холбоос удахгүй</span>' : '');
}

// Суваг солих үеийн богино шуугиан (зөөлөн)
function channelSound() {
  if (muted || !audioCtx) return;
  const len = Math.floor(audioCtx.sampleRate * 0.14);
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let k = 0; k < len; k++) data[k] = (Math.random() * 2 - 1) * (1 - k / len);
  const src = audioCtx.createBufferSource();
  const g = audioCtx.createGain();
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 1500;
  g.gain.value = 0.025;
  src.buffer = buf;
  src.connect(hp).connect(g).connect(audioCtx.destination);
  src.start();
}

let lastIndex = -1;
// Төвөөс хэр зайтай байгаагаар нь карт бүрийг 3D орон зайд байрлуулна
function layoutCarousel() {
  const W = carousel.clientWidth, H = carousel.clientHeight;
  if (!W || !H) return;                              // слайд харагдаагүй үед
  const mobile = W < 720;
  // Голын зурагтын өргөн: дэлгэцэд багтахаар (4:3 + хүрээ)
  // Доод хэсэгт нэр, дугаарын зай үлдээж, зурагтыг дээд хэсэгт багтаана
  const reserve = mobile ? 230 : 190;
  const availH = Math.max(160, H - reserve - 20);
  const cardW = Math.min(W * (mobile ? 0.74 : 0.46), (availH - 20) * 4 / 3);
  const centerY = 20 + availH / 2;
  const SIDE = mobile ? 0.3 : 0.34;                  // хажуугийн зурагтын хэмжээ
  const edge = W / 2 - (cardW * SIDE) / 2 - (mobile ? -cardW * SIDE * 0.35 : 36); // захад байрлах зай
  cards.forEach((card, i) => {
    const d = i - carIndex;
    const ad = Math.abs(d);
    card.style.width = cardW + 'px';
    card.style.top = centerY + 'px';
    let t;
    if (d === 0) t = 'translate(-50%, -50%) scale(1)';
    else if (ad === 1) t = `translate(-50%, -50%) translateX(${d * edge}px) scale(${SIDE}) rotateY(${-d * 22}deg)`;
    else t = `translate(-50%, -50%) translateX(${d * (edge + cardW * 0.4)}px) scale(${SIDE * 0.7})`;
    card.style.transform = t;
    card.style.zIndex = 10 - ad;
    card.style.opacity = ad > 1 ? 0 : 1;
    card.style.pointerEvents = ad > 1 ? 'none' : 'auto';
    card.classList.toggle('center', d === 0);
  });
  // Суваг солигдох мөчид шуугиан гаргаж, мэдээллийг зөөлөн солино
  if (lastIndex !== -1 && lastIndex !== carIndex) {
    const tv = cards[carIndex];
    tv.classList.remove('static');
    void tv.offsetWidth;
    tv.classList.add('static');
    const text = $('#tvText');
    text.classList.add('swap');
    setTimeout(() => { showTvInfo(); text.classList.remove('swap'); }, 200);
  } else if (lastIndex === -1) showTvInfo();
  lastIndex = carIndex;
  carCount.textContent = String(carIndex + 1).padStart(2, '0');
  $('#carTotal').textContent = '/' + String(cards.length).padStart(2, '0');
  $('#carPrev').disabled = carIndex === 0;
  $('#carNext').disabled = carIndex === cards.length - 1;
}
function carNext() { if (carIndex < cards.length - 1) { carIndex++; layoutCarousel(); channelSound(); } }
function carPrev() { if (carIndex > 0) { carIndex--; layoutCarousel(); channelSound(); } }
$('#carNext').addEventListener('click', carNext);
$('#carPrev').addEventListener('click', carPrev);
layoutCarousel();

// Чирж гүйлгэх (хулгана болон хуруу)
carousel.addEventListener('pointerdown', (e) => { dragStartX = e.clientX; dragged = false; });
addEventListener('pointermove', (e) => {
  if (dragStartX !== null && Math.abs(e.clientX - dragStartX) > 10) dragged = true;
});
addEventListener('pointerup', (e) => {
  if (dragStartX === null) return;
  const dx = e.clientX - dragStartX;
  dragStartX = null;
  if (dx < -50) carNext();
  else if (dx > 50) carPrev();
  setTimeout(() => { dragged = false; }, 0);
});

/* ---------- 13. «Миний тухай» хуудасны ур чадвар, жагсаалт ---------- */
$('#skillGroups').innerHTML = SKILL_GROUPS
  .map(([title, list]) => `<div class="skill-group"><b>${title}:</b><span>${list}.</span></div>`).join('');
$('#bucket').innerHTML = BUCKET
  .map(([text, done]) => `<li class="${done ? 'done' : ''}">${text}</li>`).join('');

/* =========================================================
   14. «АЛДАА АГНУУР» ТОГЛООМ
   ========================================================= */
const BUG_SVG = `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">
  <rect fill="#1b1b2f" x="1" y="3" width="1" height="1"/><rect fill="#1b1b2f" x="10" y="3" width="1" height="1"/>
  <rect fill="#1b1b2f" x="1" y="7" width="1" height="1"/><rect fill="#1b1b2f" x="10" y="7" width="1" height="1"/>
  <rect fill="#1b1b2f" x="4" y="0" width="1" height="2"/><rect fill="#1b1b2f" x="7" y="0" width="1" height="2"/>
  <rect fill="#5ec27a" x="4" y="2" width="4" height="2"/>
  <rect fill="#e25d5d" x="2" y="4" width="8" height="6"/>
  <rect fill="#1b1b2f" x="6" y="4" width="0.5" height="6"/>
  <rect fill="#fff" x="4" y="5" width="1" height="1"/><rect fill="#fff" x="8" y="7" width="1" height="1"/>
</svg>`;

const board = $('#board');
for (let i = 0; i < 9; i++) {
  board.insertAdjacentHTML('beforeend', `<div class="hole"><button class="bug" aria-label="Алдаа">${BUG_SVG}</button></div>`);
}
const holes = [...board.querySelectorAll('.hole')];
const scoreEl = $('#score'), timeEl = $('#time'), bestEl = $('#best'), gameMsg = $('#gameMsg'), gameStart = $('#gameStart');

let score = 0, timeLeft = 20, playing = false, gameTimer, spawnTimer;
let best = store.get('best', 0);

function updateGame() { scoreEl.textContent = score; timeEl.textContent = timeLeft; bestEl.textContent = best; }
updateGame();

function startGame() {
  if (playing) return;
  initAudio();
  playing = true;
  score = 0;
  timeLeft = 20;
  gameMsg.textContent = '';
  gameStart.disabled = true;
  updateGame();
  gameTimer = setInterval(() => {
    timeLeft--;
    updateGame();
    if (timeLeft <= 0) endGame();
  }, 1000);
  spawn();
}

// Санамсаргүй нүхэнд алдаа гаргана. Хугацаа багасах тусам хурдасна.
function spawn() {
  if (!playing) return;
  const free = holes.filter((h) => !h.classList.contains('up'));
  if (free.length) {
    const hole = free[Math.floor(Math.random() * free.length)];
    hole.classList.add('up');
    const stay = Math.max(500, 1000 - (20 - timeLeft) * 25);
    hole.timer = setTimeout(() => hole.classList.remove('up'), stay);
  }
  spawnTimer = setTimeout(spawn, Math.max(350, 750 - (20 - timeLeft) * 20));
}

holes.forEach((hole) => {
  hole.querySelector('.bug').addEventListener('click', () => {
    if (!playing || !hole.classList.contains('up')) return;
    score++;
    sfx.hit();
    clearTimeout(hole.timer);
    hole.classList.remove('up');
    hole.classList.add('hit');
    setTimeout(() => hole.classList.remove('hit'), 200);
    updateGame();
  });
});

function endGame() {
  playing = false;
  clearInterval(gameTimer);
  clearTimeout(spawnTimer);
  holes.forEach((h) => h.classList.remove('up'));
  if (score > best) { best = score; store.set('best', best); }
  if (score >= 15) gameMsg.textContent = `Гайхалтай! ${score} алдаа барилаа 🏆`;
  else if (score >= 8) gameMsg.textContent = `Сайн байна! ${score} алдаа 👍`;
  else gameMsg.textContent = `${score} алдаа. Дахиад оролдоорой!`;
  gameStart.disabled = false;
  gameStart.textContent = '▶ ДАХИН ТОГЛОХ';
  updateGame();
  if (score >= 15) unlock('bug');
}
gameStart.addEventListener('click', startGame);

/* =========================================================
   ТЕРМИНАЛ
   ========================================================= */
const termOut = $('#termOut');
const termIn = $('#termIn');
const termHistory = [];
let termHistIdx = 0;

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function termPrint(html, cls = '') {
  const line = document.createElement('div');
  line.className = 't-line ' + cls;
  line.innerHTML = html;
  termOut.append(line);
  termOut.scrollTop = termOut.scrollHeight;
}

const HELP = {
  help: 'командуудын жагсаалт',
  whoami: 'би хэн бэ',
  about: '«Миний тухай» хуудсыг нээх',
  projects: 'бүтээлүүдийн жагсаалт',
  skills: 'ур чадвар',
  contact: 'холбоо барих',
  date: 'Улаанбаатарын цаг',
  theme: 'горим солих (Авто / Light / Dark mode)',
  music: 'хөгжим асаах/унтраах',
  game: 'тоглоом руу очих',
  coffee: 'кофе чанах',
  hello: 'нууц 🌈',
  clear: 'дэлгэц цэвэрлэх',
  exit: 'өрөө рүү буцах',
};

const COMMANDS = {
  help: () => termPrint(Object.entries(HELP).map(([k, v]) => `<span class="t-cmd">${k.padEnd(10)}</span>${v}`).join('\n')),
  whoami: () => termPrint('Хурцболд — Санхүү, эдийн засгийн их сургуулийн 4-р курсын оюутан.\nВэб ба мобайл апп хөгжүүлэгч. Улаанбаатар 🇲🇳'),
  about: () => { termPrint('«Миний тухай» хуудсыг нээж байна...', 't-dim'); setTimeout(openAbout, 400); },
  projects: () => {
    PROJECTS.forEach((p) => {
      const link = isLink(p.code) ? ` <a href="${p.code}" target="_blank" rel="noopener">код ↗</a>` : '';
      termPrint(`• <span class="t-cmd">${p.title}</span> — ${p.tags.join(', ')}${link}`);
    });
    termPrint('<span class="t-go" data-go="0">Бүтээлүүд хэсэгт зурагтай нь үзэх →</span>');
  },
  skills: () => termPrint(SKILL_GROUPS.map(([t, l]) => `<span class="t-cmd">${t}:</span> ${l}`).join('\n')),
  contact: () => termPrint(`Имэйл:  ${escapeHtml($('#email').textContent.trim())}\nGitHub: <a href="https://github.com/Khurtsa99" target="_blank" rel="noopener">github.com/Khurtsa99</a>`),
  date: () => { const { h, m } = ubNow(); termPrint(`Улаанбаатар: ${pad2(h)}:${pad2(m)} ${h >= 7 && h < 19 ? '☀️' : '🌙'}`); },
  theme: () => { themeBtn.click(); termPrint(`Горим: ${THEME_MODES[themeMode].label}`); },
  music: () => { soundBtn.click(); termPrint(`Хөгжим: ${muted ? 'унтарлаа 🔇' : 'асав 🎵'}`); },
  game: () => { termPrint('Тоглоом руу очиж байна...', 't-dim'); setTimeout(() => changeSlide(1), 400); },
  coffee: () => termPrint('    ( (\n     ) )\n  ........\n  |      |]\n  \\      /\n   `----\'\nКофе бэлэн боллоо ☕ Одоо код бичье!'),
  hello: () => { setParty(!document.body.classList.contains('party')); termPrint('🌈 Солонго горим солигдлоо'); },
  clear: () => { termOut.innerHTML = ''; },
  exit: () => { termPrint('Баяртай! 👋', 't-dim'); setTimeout(exitOS, 400); },
  // нуугдмал командууд
  ls: () => termPrint('projects/  about.txt  secret.txt'),
  sudo: () => termPrint('Уучлаарай, энд зөвхөн Хурцболд sudo эрхтэй 😄', 't-err'),
  'cat about.txt': () => COMMANDS.whoami(),
  'cat secret.txt': () => termPrint('Шөнө цонх руу дарвал од харвана ✨ Муур маань шөнө орондоо унтдаг 🐱'),
};

function runCommand(raw) {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  termPrint(`<span class="t-in">khurts@ub:~$</span> ${escapeHtml(raw)}`);
  if (!cmd) return;
  termHistory.push(raw);
  termHistIdx = termHistory.length;
  const fn = COMMANDS[cmd] || (cmd.startsWith('sudo') ? COMMANDS.sudo : null);
  if (fn) fn();
  else termPrint(`${escapeHtml(cmd)}: команд олдсонгүй. <span class="t-cmd">help</span> гэж бичнэ үү.`, 't-err');
}

$('#termForm').addEventListener('submit', (e) => {
  e.preventDefault();
  runCommand(termIn.value);
  termIn.value = '';
  sfx.click();
});

termIn.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && termHistory.length) {        // өмнөх командууд
    e.preventDefault();
    termHistIdx = Math.max(0, termHistIdx - 1);
    termIn.value = termHistory[termHistIdx];
  } else if (e.key === 'ArrowDown' && termHistory.length) {
    e.preventDefault();
    termHistIdx = Math.min(termHistory.length, termHistIdx + 1);
    termIn.value = termHistory[termHistIdx] || '';
  } else if (e.key === 'Tab') {                           // командыг гүйцээх
    e.preventDefault();
    const match = Object.keys(HELP).find((c) => c.startsWith(termIn.value.trim().toLowerCase()));
    if (match && termIn.value.trim()) termIn.value = match;
  }
});

$('#term').addEventListener('click', (e) => { if (!e.target.closest('a, .t-go')) termIn.focus(); });
termOut.addEventListener('click', (e) => {
  const go = e.target.closest('.t-go');
  if (go) changeSlide(Number(go.dataset.go));
});

termPrint('KhurtsOS v1.0 — Улаанбаатар 🇲🇳', 't-dim');
termPrint('<span class="t-cmd">help</span> гэж бичээд Enter дарна уу.', 't-dim');

/* ---------- 15. Имэйл хуулах, он ---------- */
const copyBtn = $('#copyBtn');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#email').textContent.trim());
    copyBtn.textContent = 'Хуулагдлаа ✓';
  } catch (e) {
    copyBtn.textContent = 'Хуулж чадсангүй';
  }
  sfx.click();
  setTimeout(() => { copyBtn.textContent = 'Хуулах'; }, 1800);
});

$('#year').textContent = new Date().getFullYear();

// Холбоос нь оруулаагүй ('#') сошиал картууд шинэ таб нээхгүй
document.querySelectorAll('a.contact-card[href="#"]').forEach((a) => {
  a.addEventListener('click', (e) => e.preventDefault());
});
