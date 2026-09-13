const view = document.querySelector('#view');
const sidebar = document.querySelector('#sidebar');
const appShell = document.querySelector('.app-shell');
const mainNav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('#menu-toggle');
const backdrop = document.querySelector('#panel-backdrop');
const aboutPanel = document.querySelector('#about-panel');
const contactPanel = document.querySelector('#contact-panel');
const questPanel = document.querySelector('#quest-panel');
const toast = document.querySelector('#toast');
const toastCopy = document.querySelector('#toast-copy');
const scanLightbox = document.querySelector('#scan-lightbox');
const scanImage = document.querySelector('#scan-lightbox-image');
const scanCaption = document.querySelector('#scan-caption');
const mobileNavigationQuery = window.matchMedia('(max-width: 1040px)');
const roniaIntro = document.querySelector('#ronia-intro');
const sideSelect = document.querySelector('#side-select');
const sideTransition = document.querySelector('#side-transition');
const sideTransitionKicker = document.querySelector('#side-transition-kicker');
const sideTransitionTitle = document.querySelector('#side-transition-title');
const introRonia = document.querySelector('#intro-ronia');
const introCats = document.querySelector('#intro-cats');
const introPetScene = document.querySelector('#intro-pet-scene');
const introSpriteGhosts = new Map(
  [...document.querySelectorAll('[data-ghost-for]')].map((ghost) => [ghost.dataset.ghostFor, ghost]),
);
const introSpriteFades = new WeakMap();
const introScore = document.querySelector('#intro-score');
const introBest = document.querySelector('#intro-best');
const introHpHearts = document.querySelector('#intro-hp-hearts');
const introHpCopy = document.querySelector('#intro-hp-copy');
const introHpFill = document.querySelector('#intro-hp-fill');
const introHint = document.querySelector('#intro-hint');
const introWorld = document.querySelector('#intro-world');
const introGameover = document.querySelector('#intro-gameover');
const introFinalScore = document.querySelector('#intro-final-score');
const roniaMusic = document.querySelector('#ronia-music');
const introMusicButton = document.querySelector('[data-intro-music]');
const introPixelWipe = document.querySelector('#intro-pixel-wipe');
const cornerActions = document.querySelector('.corner-actions');
const creativeNavMarkup = mainNav?.innerHTML || '';
const techNavMarkup = `
  <button type="button" data-route="/tech"><span>⌂</span>TECH HOME</button>
  <button type="button" data-route="/tech/about"><span>◉</span>ABOUT ME</button>
  <button type="button" data-route="/tech/experience"><span>▤</span>EXPERIENCE</button>
  <button type="button" data-route="/tech/skills"><span>⌘</span>SKILLS</button>
  <button type="button" data-route="/tech/education"><span>◇</span>EDUCATION</button>
  <button type="button" data-route="/tech/contact"><span>✉</span>CONTACT</button>`;

const photo = (folder, filename) => `assets/photos/${folder}/${filename}`;
const SPRITE_ASSET_REVISION = '20260914-motion-hotfix-v1';
const spriteFrames = (folder, count) => Array.from(
  { length: count },
  (_, index) => `${folder}/frame-${String(index + 1).padStart(2, '0')}.png?v=${SPRITE_ASSET_REVISION}`,
);
const uploadedContent = window.WVEERIE_UPLOADS && typeof window.WVEERIE_UPLOADS === 'object'
  ? window.WVEERIE_UPLOADS
  : {};

function cleanUploadedText(value, fallback = '', maxLength = 500) {
  const text = typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  return (text || fallback).replace(/[<>&"']/g, '');
}

function safeUploadedImage(value) {
  if (typeof value !== 'string') return '';
  const path = value.trim();
  return /^assets\/photos\/uploads\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/i.test(path) ? path : '';
}

function safeUploadedSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/i.test(value) ? value.toLowerCase() : '';
}

function safeMediaOrientation(value) {
  return ['portrait', 'square', 'landscape', 'panorama'].includes(value) ? value : 'auto';
}

const introAnimations = {
  run: spriteFrames('assets/game/v3/sprites/ronia/run', 8),
  idle: spriteFrames('assets/game/v3/sprites/ronia/idle', 8),
  jump: spriteFrames('assets/game/v3/sprites/ronia/jump', 8),
  catsRun: spriteFrames('assets/game/v3/sprites/cats/run', 10),
  catsJump: spriteFrames('assets/game/v3/sprites/cats/jump', 8),
  catsIdle: spriteFrames('assets/game/v3/sprites/cats/idle', 10),
  petScene: spriteFrames('assets/game/v3/sprites/pet-scene', 10),
};

const INTRO_TIMING = Object.freeze({
  run: 100,
  catsRun: 100,
  jump: 118,
  idle: 150,
  catsIdle: 155,
  pet: 160,
  jumpDuration: 960,
});

const introFrameCache = new Map();

function preloadIntroFrame(source, priority = 'low') {
  if (introFrameCache.has(source)) return introFrameCache.get(source);
  const image = new Image();
  const record = { image, ready: false };
  const markReady = () => { record.ready = Boolean(image.complete && image.naturalWidth); };
  image.decoding = 'async';
  image.fetchPriority = priority;
  image.addEventListener('load', markReady, { once: true });
  image.addEventListener('error', markReady, { once: true });
  image.src = source;
  if (image.complete) markReady();
  image.decode?.().then(markReady).catch(() => {});
  introFrameCache.set(source, record);
  return record;
}

const criticalIntroFrames = [
  ...introAnimations.run,
  ...introAnimations.catsRun,
  ...introAnimations.jump,
  ...introAnimations.catsJump,
];
const deferredIntroFrames = [
  ...introAnimations.idle,
  ...introAnimations.catsIdle,
  ...introAnimations.petScene,
];
[...new Set(criticalIntroFrames)].forEach((source) => preloadIntroFrame(source, 'high'));
const preloadDeferredIntroFrames = () => {
  [...new Set(deferredIntroFrames)].forEach((source) => preloadIntroFrame(source));
};
if ('requestIdleCallback' in window) window.requestIdleCallback(preloadDeferredIntroFrames, { timeout: 1800 });
else setTimeout(preloadDeferredIntroFrames, 500);

const photos = {
  hero: photo('dgyaru', 'dgyaru4.jpeg'),
  profile: photo('snaps', 'snap1.jpg'),
};

const coreShoots = [
  {
    slug: 'dark-romance',
    title: 'DARK ROMANCE',
    category: 'EDITORIAL / PORTRAIT',
    description: 'My first studio photoshoot, created in TFP format. A black-and-white editorial and portrait series exploring a dark, romantic aesthetic through expressive lighting, mood and emotion.',
    photographer: 'Credits to add',
    creativeRole: 'Styling & makeup',
    cover: photo('bw', 'bw7.jpeg'),
    coverPosition: '52% 28%',
    gallery: ['bw7.jpeg', 'bw1.jpeg', 'bw2.jpeg', 'bw3.jpeg', 'bw5.jpeg', 'bw6.jpeg'].map((name) => photo('bw', name)),
  },
  {
    slug: 'summer-elegy',
    title: 'SUMMER ELEGY',
    category: 'OUTDOOR EDITORIAL',
    description: 'A creative outdoor shoot made with my photographer friend by the lake. I selected the styling and overall aesthetic, focusing on a natural yet expressive atmosphere and visual storytelling.',
    photographer: 'Anna Lepecheva (@yeonnme_)',
    creativeRole: 'Styling & aesthetic',
    cover: photo('water', 'water8.jpeg'),
    coverPosition: '50% 69%',
    gallery: ['water8.jpeg', 'water7.jpeg', 'water1.jpeg', 'water4.jpeg', 'water5.jpeg', 'water2.jpeg', 'water6.jpeg'].map((name) => photo('water', name)),
  },
  {
    slug: 'after-dark',
    title: 'AFTER DARK',
    category: 'FASHION / NIGHTLIFE',
    description: 'My first fully self-organized photoshoot, created in the gyaru style that I love and wear in everyday life. I developed the concept and selected the location, styling, makeup and hair.',
    photographer: 'Credits to add',
    creativeRole: 'Concept & full look',
    cover: photo('dgyaru', 'dgyaru4.jpeg'),
    coverPosition: '53% 25%',
    gallery: ['dgyaru4.jpeg', 'dgyaru1.jpeg', 'dgyaru8.jpeg', 'dgyaru2.jpeg', 'dgyaru3.jpeg', 'dgyaru5.jpeg', 'dgyaru6.jpeg', 'dgyaru7.jpeg'].map((name) => photo('dgyaru', name)),
  },
  {
    slug: 'la-nuit',
    title: 'LA NUIT',
    category: 'EDITORIAL / PORTRAIT',
    description: 'A studio shoot created in the same space as my first black-and-white session. The photographer created the set design and decorations, while I developed the styling and makeup.',
    photographer: 'Gevorg Petrosyan (@gevorg_petrosyans_photographer)',
    location: 'Petrosyans Photostudio',
    creativeRole: 'Styling & makeup',
    cover: photo('studio', 'studio2.jpeg'),
    coverPosition: '50% 22%',
    gallery: ['studio1.jpeg', 'studio2.jpeg', 'studio3.jpeg'].map((name) => photo('studio', name)),
  },
  {
    slug: 'club-2000',
    title: 'CLUB 2000',
    category: 'FASHION / GLAMOUR',
    description: 'A gyaru-inspired shoot set in a gaming center, with the location chosen by me to match the concept and atmosphere. I created the full look, including styling, makeup and the overall aesthetic.',
    photographer: '@smoroskoop',
    location: '13:20 Gaming Center (@13_20.am)',
    creativeRole: 'Concept & full look',
    cover: photo('gyaru', 'gyaru5.jpeg'),
    coverPosition: '50% 27%',
    gallery: ['gyaru5.jpeg', 'gyaru4.jpeg', 'gyaru2.jpeg', 'gyaru1.jpeg', 'gyaru3.jpeg', 'gyaru7.jpeg'].map((name) => photo('gyaru', name)),
  },
  {
    slug: 'soft-riot',
    title: 'SOFT RIOT',
    category: 'STREET / PORTRAIT',
    description: 'A nighttime street-style shoot created with my photographer friend. I developed the concept, selected the location and created the styling and makeup around a bold urban fashion aesthetic.',
    photographer: 'Credits to add',
    creativeRole: 'Concept & full look',
    cover: photo('street', 'street2.jpeg'),
    coverPosition: '51% 28%',
    gallery: ['street2.jpeg', 'street4.jpeg', 'street1.jpeg', 'street3.jpeg', 'street5.jpeg'].map((name) => photo('street', name)),
  },
  {
    slug: 'solitude',
    title: 'SOLITUDE',
    category: 'PORTRAIT / GLAMOUR',
    description: 'A studio photoshoot created by Gagik Vagramyan, who discovered me as a model on the street. I created the styling and makeup, bringing my personal aesthetic into the studio setting.',
    photographer: 'Gagik Vagramyan',
    creativeRole: 'Styling & makeup',
    cover: photo('gagik', 'gagik3.jpeg'),
    coverPosition: '50% 30%',
    gallery: ['gagik3.jpeg', 'gagik2.jpeg', 'gagik5.jpeg', 'gagik1.jpeg', 'gagik4.jpeg', 'gagik6.jpeg'].map((name) => photo('gagik', name)),
  },
  {
    slug: 'untitled',
    title: 'UNTITLED',
    category: 'PORTRAIT / GYARU',
    description: 'My first professional photoshoot, created after I was approached by a photographer on the street. This experience inspired me to pursue modeling more seriously and begin building my portfolio through TFP projects.',
    photographer: 'Credits to add',
    creativeRole: 'Model & styling',
    cover: photo('personal', 'random1.jpeg'),
    coverPosition: '50% 24%',
    gallery: ['random1.jpeg', 'random2.jpeg'].map((name) => photo('personal', name)),
  },
];

const uploadedSeriesAdditions = new Map();
(Array.isArray(uploadedContent.seriesAdditions) ? uploadedContent.seriesAdditions : []).forEach((item) => {
  const slug = safeUploadedSlug(item?.seriesSlug);
  const images = Array.isArray(item?.images) ? item.images.map(safeUploadedImage).filter(Boolean) : [];
  if (!slug || !images.length) return;
  uploadedSeriesAdditions.set(slug, [...(uploadedSeriesAdditions.get(slug) || []), ...images]);
});

const shoots = coreShoots.map((shoot) => ({
  ...shoot,
  gallery: [...shoot.gallery, ...(uploadedSeriesAdditions.get(shoot.slug) || [])],
}));

const knownShootSlugs = new Set(shoots.map((shoot) => shoot.slug));
(Array.isArray(uploadedContent.series) ? uploadedContent.series : []).forEach((item) => {
  const slug = safeUploadedSlug(item?.slug);
  const gallery = Array.isArray(item?.gallery) ? item.gallery.map(safeUploadedImage).filter(Boolean) : [];
  if (!slug || knownShootSlugs.has(slug) || !gallery.length) return;
  const cover = safeUploadedImage(item?.cover) || gallery[0];
  shoots.push({
    slug,
    title: cleanUploadedText(item?.title, 'NEW STORY', 80),
    category: cleanUploadedText(item?.category, 'EDITORIAL / PORTRAIT', 80),
    description: cleanUploadedText(item?.description, 'A new story from Aurora’s personal archive.', 800),
    photographer: cleanUploadedText(item?.photographer, 'Credits to add', 120),
    creativeRole: cleanUploadedText(item?.creativeRole, 'Model & creative direction', 120),
    location: cleanUploadedText(item?.location, '', 120),
    cover,
    coverPosition: /^\d{1,3}%\s+\d{1,3}%$/.test(item?.coverPosition || '') ? item.coverPosition : '50% 30%',
    gallery,
  });
  knownShootSlugs.add(slug);
});

const portfolioImageCount = shoots.reduce((total, shoot) => total + shoot.gallery.length, 0);

const modelSnaps = [
  ['HEADSHOT', photo('snaps', 'snap1.jpg'), 'portrait'],
  ['FULL LENGTH', photo('snaps', 'snap2.jpg'), 'portrait'],
  ['THREE QUARTER', photo('snaps', 'snap3.jpg'), 'portrait'],
  ['PROFILE', photo('snaps', 'snap4.jpg'), 'portrait'],
];
(Array.isArray(uploadedContent.modelSnaps) ? uploadedContent.modelSnaps : []).forEach((item, index) => {
  const image = safeUploadedImage(item?.image);
  if (!image) return;
  modelSnaps.push([
    cleanUploadedText(item?.label, `MODEL SNAP ${String(index + 5).padStart(2, '0')}`, 80),
    image,
    safeMediaOrientation(item?.orientation),
  ]);
});

const personalSnaps = (Array.isArray(uploadedContent.personalSnaps) ? uploadedContent.personalSnaps : [])
  .map((item, index) => {
    const image = safeUploadedImage(item?.image);
    if (!image) return null;
    const tilt = Number(item?.tilt);
    return [
      cleanUploadedText(item?.title, `PERSONAL FILE ${String(index + 1).padStart(2, '0')}`, 80),
      cleanUploadedText(item?.date, 'NEW', 40),
      image,
      Number.isFinite(tilt) ? `${Math.max(-5, Math.min(5, tilt))}deg` : `${((index % 5) - 2) * .8}deg`,
      safeMediaOrientation(item?.orientation),
    ];
  })
  .filter(Boolean);

const artworks = (Array.isArray(uploadedContent.artworks) ? uploadedContent.artworks : [])
  .map((item, index) => {
    const image = safeUploadedImage(item?.image);
    if (!image) return null;
    return {
      title: cleanUploadedText(item?.title, `ARTWORK ${String(index + 1).padStart(2, '0')}`, 80),
      meta: cleanUploadedText(item?.meta, 'PERSONAL WORK', 80),
      text: cleanUploadedText(item?.text, 'A new entry from Aurora’s creative archive.', 500),
      image,
      orientation: safeMediaOrientation(item?.orientation),
    };
  })
  .filter(Boolean);
const archiveImageCount = portfolioImageCount + modelSnaps.length + personalSnaps.length + artworks.length;

const corePublications = [
  {
    slug: 'edith-1456',
    title: 'AURORA',
    publication: 'EDITH MAGAZINE',
    issue: 'ISSUE 1456 · AUGUST 2026 · PAGES 46–51',
    viewerIssue: 'ISSUE 1456 · AUGUST 2026',
    description: 'Inspired by Aurora, the Roman goddess of dawn, this editorial explores the quiet space between night and day. Surrounded by wildflowers, water, and the first golden light, the series reflects themes of renewal, softness, and the fleeting beauty of sunrise. It captures a moment where mythology and nature gently intertwine.',
    credits: ['Model — Aurora Maximova @wveerie', 'Photographer — Anna Lepecheva @yeonnme_'],
    scanPages: ['46–47', '48–49', '50–51'],
    scanLabel: 'SPREAD',
    scans: [
      'assets/publications/edith-1456-spread-46-47.jpg',
      'assets/publications/edith-1456-spread-48-49.jpg',
      'assets/publications/edith-1456-spread-50-51.jpg',
    ],
  },
  {
    slug: 'iconique-portrait',
    title: 'PORTRAIT',
    publication: 'ICONIQUE MAGAZINE',
    issue: 'SEPTEMBER 2026 · VOL. 2 · PAGES 32–34',
    viewerIssue: 'SEPTEMBER 2026 · VOL. 2',
    description: 'A cinematic portrait editorial by Gagik Vagramyan, balancing softness with theatrical mystery. Veils, sculptural gestures and contrasting black-and-white styling shape a story about vulnerability, transformation and the many faces held inside a single portrait.',
    credits: ['Model — Aurora Maximova @wveerie', 'Photographer — Gagik Vagramyan', 'Styling & makeup — Aurora Maximova'],
    layout: 'portrait',
    scanPages: ['32', '33', '34'],
    scanLabel: 'PAGE',
    scans: [
      'assets/publications/iconique-sept-2026-page-32.jpg',
      'assets/publications/iconique-sept-2026-page-33.jpg',
      'assets/publications/iconique-sept-2026-page-34.jpg',
    ],
  },
];

const publications = [...corePublications];
const knownPublicationSlugs = new Set(publications.map((publication) => publication.slug));
(Array.isArray(uploadedContent.publications) ? uploadedContent.publications : []).forEach((item, itemIndex) => {
  const scans = Array.isArray(item?.scans) ? item.scans.map(safeUploadedImage).filter(Boolean) : [];
  const slug = safeUploadedSlug(item?.slug);
  if (!slug || knownPublicationSlugs.has(slug) || !scans.length) return;
  const rawPages = Array.isArray(item?.scanPages) ? item.scanPages : [];
  const rawCredits = Array.isArray(item?.credits) ? item.credits : [];
  const rawMeta = Array.isArray(item?.scanMeta) ? item.scanMeta : [];
  const scanLabel = cleanUploadedText(item?.scanLabel, 'PAGE', 10).toUpperCase() === 'SPREAD' ? 'SPREAD' : 'PAGE';
  publications.push({
    slug,
    title: cleanUploadedText(item?.title, `EDITORIAL ${String(itemIndex + 1).padStart(2, '0')}`, 80),
    publication: cleanUploadedText(item?.publication, 'MAGAZINE', 100),
    issue: cleanUploadedText(item?.issue, 'ISSUE DETAILS TO ADD', 140),
    viewerIssue: cleanUploadedText(item?.viewerIssue, cleanUploadedText(item?.issue, 'ISSUE', 140), 140),
    description: cleanUploadedText(item?.description, 'A published editorial from Aurora’s archive.', 1200),
    credits: rawCredits.map((credit) => cleanUploadedText(credit, '', 180)).filter(Boolean).slice(0, 12),
    layout: item?.layout === 'portrait' ? 'portrait' : 'auto',
    scanPages: scans.map((_, index) => cleanUploadedText(rawPages[index], String(index + 1).padStart(2, '0'), 32)),
    scanLabel,
    scans,
    scanMeta: scans.map((_, index) => ({ orientation: safeMediaOrientation(rawMeta[index]?.orientation) })),
  });
  knownPublicationSlugs.add(slug);
});

const publicationScanCount = publications.reduce((total, publication) => total + publication.scans.length, 0);

const digitalProjects = [
  {
    title: 'WVEERIE ARCHIVE',
    meta: 'PROJECT 01 · 2026',
    text: 'This portfolio itself: a living model archive combining fashion photography, game UI and soft gyaru details.',
    tags: ['PORTFOLIO', 'ARCHIVE', 'WEB'],
    image: photo('water', 'water4.jpeg'),
  },
];

const socialLogs = [
  {
    title: 'AURORA / SOLACE',
    meta: 'PUBLIC INSTAGRAM LOG · @wveerie',
    text: 'Aurora — in Roman mythology, the goddess of the dawn who brings daylight to gods and mortals. The mother of the stars, forever standing between night and sunrise. Solace.',
    credit: 'By Anna Lepecheva @yeonnme_',
    image: photo('water', 'water7.jpeg'),
    url: 'https://www.instagram.com/wveerie/p/DblNWNJDElP/',
  },
  {
    title: 'SOMEWHERE BETWEEN',
    meta: 'PUBLIC INSTAGRAM LOG · STUDIO',
    text: 'somewhere between o(︶︿︶)o',
    credit: 'By @gevorg_petrosyans_photographer · @petrosyans_photostudio',
    image: photo('studio', 'studio2.jpeg'),
    url: 'https://www.instagram.com/wveerie/p/DY-Do-kDPvn/',
  },
  {
    title: 'GAL IS MIND',
    meta: 'PUBLIC INSTAGRAM LOG · GYARU',
    text: 'I got the swag and it’s pumping out my ovaries. Gal is mind (^з^)-☆',
    credit: 'By @smoroskoop · at @13_20.am',
    image: photo('gyaru', 'gyaru5.jpeg'),
    url: 'https://www.instagram.com/wveerie/p/DXKQuabDEtr/',
  },
];

const GAME_SAVE_KEY = 'wveerie-player-save-v2';
const PORTFOLIO_SIDE_KEY = 'wveerie-portfolio-side-v1';
const emptyGameState = { visited: [], openedSeries: [], mediaViews: 0, panels: [] };
const questDefinitions = [
  { id: 'portfolio', label: 'ENTER THE ARCHIVE', hint: 'Visit Portfolio', done: (state) => state.visited.includes('/portfolio') },
  { id: 'series', label: 'OPEN A STORY', hint: 'Open one photo series', done: (state) => state.openedSeries.length > 0 },
  { id: 'viewer', label: 'INSPECT A MEMORY', hint: 'Open any image fullscreen', done: (state) => state.mediaViews > 0 },
  { id: 'profile', label: 'MEET THE PLAYER', hint: 'Read About Me', done: (state) => state.panels.includes('about') },
  { id: 'press', label: 'FIND THE MAGAZINE', hint: 'Visit Projects', done: (state) => state.visited.includes('/projects') },
];

function loadGameState() {
  try {
    const stored = JSON.parse(localStorage.getItem(GAME_SAVE_KEY) || '{}');
    const stringList = (value) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : [];
    const mediaViews = Number(stored?.mediaViews);
    return {
      visited: stringList(stored?.visited),
      openedSeries: stringList(stored?.openedSeries),
      mediaViews: Number.isFinite(mediaViews) && mediaViews > 0 ? Math.floor(mediaViews) : 0,
      panels: stringList(stored?.panels),
    };
  } catch {
    return {
      visited: [],
      openedSeries: [],
      mediaViews: 0,
      panels: [],
    };
  }
}

function loadPortfolioSide() {
  try {
    return localStorage.getItem(PORTFOLIO_SIDE_KEY) === 'tech' ? 'tech' : 'creative';
  } catch {
    return 'creative';
  }
}

let activePortfolioSide = loadPortfolioSide();
let sideTransitionBusy = false;
let sideTransitionTimers = [];

function updatePortfolioChrome() {
  const isTech = activePortfolioSide === 'tech';
  if (mainNav) mainNav.innerHTML = isTech ? techNavMarkup : creativeNavMarkup;
  const brand = document.querySelector('.brand-link');
  if (brand) {
    brand.textContent = isTech ? 'wveerie.sys' : 'wveerie.exe';
    brand.dataset.route = isTech ? '/tech' : '/home';
    brand.setAttribute('aria-label', isTech ? 'Return to technical portfolio home' : 'Return to creative portfolio home');
  }
  const mobileBrand = document.querySelector('.mobile-brand');
  if (mobileBrand) {
    mobileBrand.dataset.route = isTech ? '/tech' : '/home';
    mobileBrand.childNodes[0].textContent = isTech ? 'WVEERIE.SYS ' : 'WVEERIE ';
  }
  const portrait = document.querySelector('.creative-profile-photo');
  const pixelAvatar = document.querySelector('.tech-profile-avatar');
  if (portrait) portrait.hidden = isTech;
  if (pixelAvatar) pixelAvatar.hidden = !isTech;
  const profileRole = document.querySelector('#profile-chip-role');
  if (profileRole) profileRole.textContent = isTech ? 'IT RECRUITER / LEFT HEMISPHERE' : 'MODEL / RIGHT HEMISPHERE';
  const toggle = document.querySelector('[data-side-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-label', isTech ? 'Switch to the creative portfolio' : 'Switch to the technical portfolio');
    toggle.innerHTML = isTech ? '<span>♡ MODEL PORTFOLIO</span><b>R</b>' : '<span>⌘ TECH PORTFOLIO</span><b>L</b>';
  }
}

function applyPortfolioSide(side = activePortfolioSide, { persist = true } = {}) {
  activePortfolioSide = side === 'tech' ? 'tech' : 'creative';
  const isTech = activePortfolioSide === 'tech';
  document.documentElement.dataset.portfolio = activePortfolioSide;
  document.documentElement.dataset.theme = isTech ? 'dark' : 'soft';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isTech ? '#080f19' : '#f6edf8');
  updatePortfolioChrome();
  try {
    if (persist) localStorage.setItem(PORTFOLIO_SIDE_KEY, activePortfolioSide);
  } catch {
    // Portfolio-side persistence is optional.
  }
}

function resetSideTransition() {
  sideTransitionTimers.forEach((timer) => clearTimeout(timer));
  sideTransitionTimers = [];
  sideTransitionBusy = false;
  document.body.classList.remove('side-transitioning');
  if (!sideTransition) return;
  sideTransition.classList.remove('is-active');
  sideTransition.removeAttribute('data-side');
  sideTransition.setAttribute('aria-hidden', 'true');
  sideTransition.hidden = true;
}

function switchPortfolioSide(nextSide, { destination, fromChooser = false } = {}) {
  const selectedSide = nextSide === 'tech' ? 'tech' : 'creative';
  const nextRoute = destination || (selectedSide === 'tech' ? '/tech' : '/home');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sideTransitionBusy) return;

  const applyDestination = () => {
    applyPortfolioSide(selectedSide);
    if (fromChooser && sideSelect) {
      sideSelect.classList.remove('is-visible', 'is-leaving');
      sideSelect.removeAttribute('data-selected');
      sideSelect.removeAttribute('data-focus');
      sideSelect.hidden = true;
      sideSelect.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('side-select-open');
      introReturnTarget = 'archive';
    }
    syncPageInert();
    navigate(nextRoute);
  };

  const finishTransition = () => {
    resetSideTransition();
    view.focus({ preventScroll: true });
    showToast(selectedSide === 'tech' ? 'Logical hemisphere connected. WVEERIE.SYS online ⌘' : 'Creative hemisphere connected. WVEERIE archive online ♡');
  };

  if (reducedMotion || !sideTransition) {
    applyDestination();
    finishTransition();
    return;
  }

  sideTransitionBusy = true;
  sideTransition.dataset.side = selectedSide;
  sideTransitionKicker.textContent = selectedSide === 'tech' ? 'LEFT HEMISPHERE // LINK' : 'RIGHT HEMISPHERE // LINK';
  sideTransitionTitle.textContent = selectedSide === 'tech' ? 'LOGIC MODE ONLINE' : 'IMAGINATION ONLINE';
  sideTransition.hidden = false;
  sideTransition.setAttribute('aria-hidden', 'false');
  document.body.classList.add('side-transitioning');
  requestAnimationFrame(() => sideTransition.classList.add('is-active'));
  sideTransitionTimers.push(setTimeout(applyDestination, 470));
  sideTransitionTimers.push(setTimeout(finishTransition, 1120));
}

function togglePortfolioSide() {
  const nextSide = activePortfolioSide === 'tech' ? 'creative' : 'tech';
  switchPortfolioSide(nextSide, { destination: nextSide === 'tech' ? '/tech' : '/home' });
}

let gameState = loadGameState();
let panelFocusReturnTarget = null;
let mediaFocusReturnTarget = null;

function syncPageInert() {
  const hasOpenPanel = [aboutPanel, contactPanel, questPanel].some((panel) => panel && !panel.hidden);
  const blocked = Boolean(
    (roniaIntro && !roniaIntro.hidden)
    || (sideSelect && !sideSelect.hidden)
    || hasOpenPanel
    || (scanLightbox && !scanLightbox.hidden),
  );
  appShell?.toggleAttribute('inert', blocked);
  cornerActions?.toggleAttribute('inert', blocked);
}

function restoreFocus(target) {
  if (target instanceof HTMLElement && target.isConnected && !target.closest('[inert]')) {
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }
}

function completedQuestIds(state = gameState) {
  return questDefinitions.filter((quest) => quest.done(state)).map((quest) => quest.id);
}

function gameXp() {
  return gameState.visited.length * 9 + gameState.openedSeries.length * 11 + Math.min(gameState.mediaViews, 12) * 4 + gameState.panels.length * 8 + completedQuestIds().length * 18;
}

function saveGame() {
  try {
    localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(gameState));
  } catch {
    // The portfolio still works when browser storage is unavailable.
  }
}

function updateGameUI() {
  const xp = gameXp();
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  document.querySelector('#player-level').textContent = `LVL ${String(level).padStart(2, '0')}`;
  document.querySelector('#mobile-level').textContent = `LVL ${String(level).padStart(2, '0')}`;
  document.querySelector('#player-xp').textContent = `${progress} / 100`;
  document.querySelector('#xp-fill').style.width = `${progress}%`;
  const completed = completedQuestIds();
  document.querySelector('#quest-count').textContent = `${completed.length}/${questDefinitions.length}`;
  questDefinitions.forEach((quest) => {
    const row = document.querySelector(`[data-quest-row="${quest.id}"]`);
    if (!row) return;
    const done = completed.includes(quest.id);
    row.classList.toggle('complete', done);
    row.querySelector('b').textContent = done ? 'DONE' : 'OPEN';
  });
  saveGame();
}

function recordAction(type, value) {
  const before = completedQuestIds();
  if (type === 'visit' && !gameState.visited.includes(value)) gameState.visited.push(value);
  if (type === 'series' && !gameState.openedSeries.includes(value)) gameState.openedSeries.push(value);
  if (type === 'panel' && !gameState.panels.includes(value)) gameState.panels.push(value);
  if (type === 'media') gameState.mediaViews += 1;
  updateGameUI();
  const unlocked = completedQuestIds().find((id) => !before.includes(id));
  if (unlocked) {
    const quest = questDefinitions.find((item) => item.id === unlocked);
    showToast(`Quest complete: ${quest.label} ✦`);
  }
}

function renderTechPortfolio() {
  const skills = ['IT RECRUITING', 'C#', 'PYTHON', 'REST / API', 'AGILE', 'DATABASES', 'DATA MANAGEMENT', 'PROCESS COORDINATION', 'CANDIDATE COMMUNICATION', 'ENGLISH C1', 'EMOTIONAL INTELLIGENCE', 'TEAMWORK'];
  const experience = [
    {
      period: 'OCT 2025 — APR 2026',
      company: 'WEBPROPRESENTS',
      role: 'JUNIOR HR · PART-TIME',
      copy: 'Supported recruitment processes and candidate communication, maintained employee databases and documentation, organized internal workflows, and helped teams stay connected.',
      signal: 'RECRUITMENT / PEOPLE OPS / DATABASES',
    },
    {
      period: 'JUN 2024 — NOV 2024',
      company: 'CINEMACLUB',
      role: 'DATA ENTRY ASSISTANT · FREELANCE',
      copy: 'Collected and organized actor information, updated databases accurately, and maintained structured digital records for fast access and retrieval.',
      signal: 'DATA QUALITY / RESEARCH / RECORDS',
    },
    {
      period: 'MAY 2022 — PRESENT',
      company: 'FREELANCE',
      role: 'TUTOR & CHILDCARE ASSISTANT',
      copy: 'Four-plus years of building trust, explaining complex ideas clearly, and adapting communication to different people, including children with disabilities and behavioral difficulties.',
      signal: 'COMMUNICATION / ADAPTABILITY / EMPATHY',
    },
  ];
  return `
    <section class="page tech-page">
      <div class="tech-scanlines" aria-hidden="true"></div>
      <header class="tech-hero" id="tech-overview">
        <div class="tech-hero-copy">
          <p class="tech-kicker">LEFT HEMISPHERE // PROFILE_01</p>
          <div class="tech-availability"><i></i> OPEN TO IT RECRUITING OPPORTUNITIES</div>
          <h1>HUMAN<br /><span>+</span> SYSTEMS</h1>
          <p class="tech-deck">I’m Aurora — an IT recruiter with a strong interest in technology who enjoys translating between people, products, and systems.</p>
          <div class="tech-actions">
            <button class="tech-button primary" type="button" data-route="/tech/about">ABOUT MY APPROACH</button>
            <button class="tech-button" type="button" data-route="/tech/experience">EXPLORE EXPERIENCE</button>
            <a class="tech-button" href="mailto:avrora.maximova@gmail.com">SEND A SIGNAL ↗</a>
          </div>
          <dl class="tech-facts">
            <div><dt>BASE</dt><dd>Russia, RUSSIA</dd></div>
            <div><dt>FOCUS</dt><dd>IT RECRUITING</dd></div>
            <div><dt>LANGUAGE</dt><dd>ENGLISH C1</dd></div>
            <div><dt>MODE</dt><dd>REMOTE / HYBRID / ONSITE</dd></div>
          </dl>
        </div>
        <div class="tech-console" aria-label="Aurora's technical profile summary">
          <div class="tech-console-bar"><span>AURORA_PROFILE.SYS</span><b>● ● ●</b></div>
          <div class="tech-console-body">
            <span class="console-line"><i>01</i><code>const role = "IT Recruiter";</code></span>
            <span class="console-line"><i>02</i><code>learning = "tech, people, systems";</code></span>
            <span class="console-line"><i>03</i><code>stack = ["C#", "API", "Agile"];</code></span>
            <span class="console-line"><i>04</i><code>strength = connect(people, tech);</code></span>
            <span class="console-line console-success"><i>05</i><code>status: READY_TO_COLLABORATE</code></span>
            <div class="logic-core" aria-hidden="true"><span></span><span></span><span></span><span></span><b>AM</b></div>
          </div>
        </div>
      </header>

      <section class="tech-section tech-about-section" id="tech-about">
        <div class="tech-section-head"><p>01 / PROFILE LOG</p><h2>ABOUT ME</h2><span>The person behind the process.</span></div>
        <div class="tech-about-layout">
          <article class="tech-about-copy">
            <span>// AURORA_MAXIMOVA.TXT</span>
            <h3>CURIOUS ABOUT PEOPLE.<br />SERIOUS ABOUT SYSTEMS.</h3>
            <p>I’m an IT recruiter who likes understanding both sides of a role: the person looking for the right place to grow and the team searching for someone who will genuinely fit. I enjoy turning scattered information into a clear process, keeping communication human, and making sure important details do not get lost along the way.</p>
            <p>My interest in technology began long before recruiting. I started exploring programming when I was younger and continue learning through Python, C#, APIs, AI tools, and the logic behind digital products. A physics and mathematics background taught me to ask precise questions, look for patterns, and stay patient with complex problems.</p>
            <p>What connects these interests is curiosity. I want to understand how people think, how teams work, and how technology is built. My goal is to keep growing inside IT recruiting and contribute to teams where empathy, structure, and technical understanding are equally valuable.</p>
          </article>
          <aside class="tech-about-notes" aria-label="Technical profile highlights">
            <div><span>CORE_01</span><strong>PEOPLE</strong><p>Candidate communication, trust, empathy, and thoughtful collaboration.</p></div>
            <div><span>CORE_02</span><strong>STRUCTURE</strong><p>Clear records, organized workflows, careful research, and attention to detail.</p></div>
            <div><span>CORE_03</span><strong>TECH</strong><p>Continuous self-directed learning across programming, APIs, AI, and digital systems.</p></div>
          </aside>
        </div>
      </section>

      <section class="tech-section" id="tech-experience">
        <div class="tech-section-head"><p>02 / WORK LOG</p><h2>EXPERIENCE</h2><span>People-first work, organized like a system.</span></div>
        <div class="tech-timeline">
          ${experience.map((item, index) => `<article class="tech-log-card"><span class="tech-log-index">${String(index + 1).padStart(2, '0')}</span><div class="tech-log-period">${item.period}</div><div><p>${item.company}</p><h3>${item.role}</h3><span>${item.copy}</span><b>${item.signal}</b></div></article>`).join('')}
        </div>
      </section>

      <section class="tech-section tech-skills-section" id="tech-skills">
        <div class="tech-section-head"><p>03 / CAPABILITY MATRIX</p><h2>SKILLS</h2><span>Technical literacy with a human interface.</span></div>
        <div class="tech-skill-layout">
          <div class="skill-cloud">${skills.map((skill, index) => `<span style="--skill-index:${index}">${skill}</span>`).join('')}</div>
          <div class="skill-radar" aria-hidden="true"><i></i><i></i><i></i><i></i><b>PEOPLE<br />×<br />TECH</b></div>
        </div>
        <div class="tech-principles">
          <article><span>INPUT</span><h3>LISTEN</h3><p>Understand the person, the role, and the real problem before acting.</p></article>
          <article><span>PROCESS</span><h3>STRUCTURE</h3><p>Turn scattered information into clear records, workflows, and decisions.</p></article>
          <article><span>OUTPUT</span><h3>CONNECT</h3><p>Help candidates and technical teams speak the same language.</p></article>
        </div>
      </section>

      <section class="tech-section" id="tech-education">
        <div class="tech-section-head"><p>04 / LEARNING PATH</p><h2>EDUCATION</h2><span>Built on mathematics, curiosity, and continuous learning.</span></div>
        <div class="education-grid">
          <article class="education-card"><span>2025 · COMPLETED</span><h3>LOMONOSOV GYMNASIUM №1530</h3><p>Physics and Mathematics track.</p><b>PHYSICS / MATHEMATICS</b></article>
          <article class="education-card"><span>BACKGROUND PROCESS</span><h3>SELF-DIRECTED TECH LEARNING</h3><p>Started exploring Python in childhood and later developed hands-on familiarity with C#, APIs, Agile methodologies, AI, computational systems, and scientific research.</p><b>CURIOUS BY DEFAULT</b></article>
        </div>
      </section>

      <section class="tech-contact" id="tech-contact">
        <span>05 / NEW CONNECTION</span>
        <h2>LET’S CONNECT<br />PEOPLE + TECHNOLOGY.</h2>
        <p>I’m interested in IT recruiting and people-focused roles inside software, technology, and innovative teams.</p>
        <a href="mailto:avrora.maximova@gmail.com">AVRORA.MAXIMOVA@GMAIL.COM ↗</a>
      </section>
      ${footer()}
    </section>`;
}

function footer() {
  const isTech = activePortfolioSide === 'tech';
  return `<footer class="footer"><button class="footer-brand" type="button" data-route="${isTech ? '/tech' : '/home'}">${isTech ? 'WVEERIE.SYS' : 'WVEERIE'}</button><span>© 2026 Aurora Maximova · ${isTech ? 'technical portfolio' : 'personal creative archive'}</span><span>STATUS: ${isTech ? 'OPEN TO WORK ⌘' : 'GROWING ♡'}</span></footer>`;
}

function mediaButton({ src, group, caption, alt, className = 'media-button', label = 'OPEN FULLSCREEN +', orientation = 'auto' }) {
  return `<button class="${className}" type="button" data-auto-media-card data-orientation="${safeMediaOrientation(orientation)}" data-media-src="${src}" data-media-group="${group}" data-media-caption="${caption}" aria-label="Open ${caption} fullscreen">
    <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
    <span class="zoom-hint">${label}</span>
  </button>`;
}

function classifyMediaImage(image) {
  const card = image.closest('[data-auto-media-card]');
  if (!card || !image.naturalWidth || !image.naturalHeight) return;
  const ratio = image.naturalWidth / image.naturalHeight;
  let orientation = 'square';
  if (ratio >= 1.8) orientation = 'panorama';
  else if (ratio > 1.1) orientation = 'landscape';
  else if (ratio < .9) orientation = 'portrait';
  card.dataset.orientation = orientation;
  card.style.setProperty('--media-aspect', `${image.naturalWidth} / ${image.naturalHeight}`);
}

function initAdaptiveMedia() {
  view.querySelectorAll('[data-auto-media-card] img').forEach((image) => {
    if (image.complete && image.naturalWidth) classifyMediaImage(image);
    else image.addEventListener('load', () => classifyMediaImage(image), { once: true });
  });
}

function shootCards(items = shoots) {
  return items.map((shoot, index) => `
    <button class="shoot-card" type="button" data-shoot="${shoot.slug}" aria-label="Open ${shoot.title}">
      <span class="shoot-media">
        <img src="${shoot.cover}" alt="${shoot.title} editorial cover featuring Aurora Maximova" loading="lazy" decoding="async" style="object-position:${shoot.coverPosition}" />
        <span class="card-index">ARCHIVE ${String(index + 1).padStart(3, '0')}</span>
      </span>
      <span class="shoot-caption">
        <div><span class="meta-label">${shoot.category}</span><h3>${shoot.title}</h3><p>${shoot.gallery.length} photographs</p></div>
        <span class="view-arrow">VIEW →</span>
      </span>
    </button>`).join('');
}

function renderHome() {
  return `
    <div class="page home-page">
      <section class="hero">
        <div class="hero-copy">
          <span class="status-pill"><i></i> STATUS: ONLINE · ${archiveImageCount} IMAGES</span>
          <p class="kicker">RIGHT HEMISPHERE // CREATIVE PROFILE_02</p>
          <h1><button class="hero-title" type="button" data-route="/home">WVEERIE</button></h1>
          <p class="hero-name">AURORA MAXIMOVA</p>
          <p class="hero-role">MODEL / ARTIST / CREATIVE</p>
          <div class="hero-progress"><span>${shoots.length} SERIES SYNCED</span><div><i></i></div></div>
          <div class="action-row">
            <button class="game-button primary" type="button" data-route="/portfolio">VIEW PORTFOLIO</button>
            <button class="game-button" type="button" data-route="/snaps">MODEL SNAPS</button>
          </div>
          <div class="mini-stats">
            <div><span>HEIGHT</span><strong>160 CM</strong></div>
            <div><span>MEASUREMENTS</span><strong>73 / 59 / 79</strong></div>
            <div><span>LOCATION</span><strong>RUSSIA</strong></div>
          </div>
        </div>
        <div class="hero-photo">
          <button class="hero-media-button" type="button" data-media-src="${photos.hero}" data-media-group="hero" data-media-caption="WVEERIE · AFTER DARK" aria-label="Open hero photograph fullscreen">
            <img src="${photos.hero}" alt="Aurora Maximova in a gyaru editorial beside a vintage piano" decoding="async" fetchpriority="high" />
          </button>
          <span class="photo-badge">PHOTO UNLOCKED<br><b>ARCHIVE 001</b></span>
          <span class="photo-sticker">♡ WVEERIE ARCHIVE ♡</span>
          <span class="hero-guide"><b>RONIA GUIDE:</b> Tap any photograph to inspect the memory. Complete quests to level up ✦</span>
          <span class="hero-sparkle one">✦</span><span class="hero-sparkle two">♥</span><span class="hero-sparkle three">◇</span>
        </div>
      </section>
      <section class="content-page">
        <div class="section-rule" aria-hidden="true"></div>
        <div class="subsection-head">
          <div><p class="kicker">◎ MISSIONS COMPLETED</p><h2>SELECTED WORK</h2></div>
          <button class="game-button" type="button" data-route="/portfolio">VIEW ALL →</button>
        </div>
        <div class="archive-grid">${shootCards(shoots.slice(0, 4))}</div>
        <div class="subsection-head">
          <div><p class="kicker">♥ PROFILE NOTE</p><h2>WHO IS AURORA?</h2></div>
          <p>My name is Aurora, and I’m a model, creative, and visual storyteller based in Russia. Modeling is how I explore identity, fashion, emotion, and the different sides of my personality.</p>
        </div>
        <div class="action-row"><button class="game-button primary" type="button" data-panel="about">OPEN PROFILE.EXE</button><button class="game-button" type="button" data-route="/projects">VIEW PROJECTS</button></div>
        <p class="empty-note"><strong>LIVE ARCHIVE: ${archiveImageCount} IMAGES + ${publicationScanCount} MAGAZINE SCANS.</strong> Aurora’s real photographs, the Edith and ICONIQUE editorials, and the stories behind every series now live together here.</p>
        ${footer()}
      </section>
    </div>`;
}

function renderPortfolio() {
  return `
    <section class="page content-page">
      <div class="section-rule" aria-hidden="true"></div>
      <header class="page-head"><p class="kicker">◎ ${shoots.length} SERIES · ${portfolioImageCount} PORTFOLIO IMAGES</p><h1 class="page-title">PORTFOLIO</h1><p class="page-intro">Editorial, portrait, street and location stories in the same order as the Portfoliobox archive. Every series opens as its own full-frame entry.</p></header>
      <div class="archive-grid">${shootCards()}</div>
      ${footer()}
    </section>`;
}

function renderShoot(slug) {
  const foundIndex = shoots.findIndex((item) => item.slug === slug);
  const index = foundIndex === -1 ? 0 : foundIndex;
  const shoot = shoots[index];
  const prev = shoots[(index - 1 + shoots.length) % shoots.length];
  const next = shoots[(index + 1) % shoots.length];
  document.title = `${shoot.title} — WVEERIE`;
  return `
    <article class="page shoot-page">
      <div class="shoot-toolbar"><button class="game-button" type="button" data-route="/portfolio">← BACK</button><button class="shoot-brand" type="button" data-route="/home">WVEERIE</button></div>
      <div class="shoot-intro">
        <div><span class="meta-label">◎ ${shoot.category}</span><h1>${shoot.title}</h1><p class="shoot-description">${shoot.description}</p></div>
        <div class="credits">
          <div><span>PHOTOGRAPHER</span><strong>${shoot.photographer}</strong></div>
          <div><span>MODEL</span><strong>Aurora Maximova</strong></div>
          <div><span>CREATIVE ROLE</span><strong>${shoot.creativeRole}</strong></div>
          ${shoot.location ? `<div><span>LOCATION</span><strong>${shoot.location}</strong></div>` : ''}
          <div><span>IMAGES</span><strong>${shoot.gallery.length}</strong></div>
        </div>
      </div>
      <div class="shoot-gallery">
        ${shoot.gallery.map((image, galleryIndex) => `<figure>${mediaButton({ src: image, group: `shoot-${shoot.slug}`, caption: `${shoot.title} · ${String(galleryIndex + 1).padStart(2, '0')} / ${String(shoot.gallery.length).padStart(2, '0')}`, alt: `${shoot.title} photograph ${galleryIndex + 1} of ${shoot.gallery.length}`, className: 'gallery-image-button' })}</figure>`).join('')}
      </div>
      <nav class="shoot-nav" aria-label="Photoshoot navigation"><button class="game-button" type="button" data-shoot="${prev.slug}">← ${prev.title}</button><button class="game-button primary" type="button" data-shoot="${next.slug}">${next.title} →</button></nav>
    </article>`;
}

function renderArtwork() {
  return `
    <section class="page content-page">
      <div class="section-rule" aria-hidden="true"></div>
      <header class="page-head"><p class="kicker">✎ VISUAL EXPERIMENTS</p><h1 class="page-title">ARTWORK</h1><p class="page-intro">Illustration, digital art, image experiments and little things that do not need to behave like a formal portfolio.</p></header>
      ${artworks.length ? `<div class="art-grid">${artworks.map((item, index) => `<figure class="art-card">${mediaButton({ src: item.image, group: 'artwork', caption: `${item.title} · ${index + 1}/${artworks.length}`, alt: item.title, className: 'art-media-button', orientation: item.orientation })}<figcaption><span class="meta-label">${item.meta}</span><h3>${item.title}</h3><p>${item.text}</p></figcaption></figure>`).join('')}</div>` : `<div class="archive-empty"><span class="meta-label">FILE SLOT 001</span><h2>ARTWORK COMING NEXT</h2><p>No stock images here. This space is ready for Aurora’s real drawings, edits, scans and digital experiments when the files arrive. Every future artwork will open in the same fullscreen viewer as the magazine.</p></div>`}
      ${footer()}
    </section>`;
}

function renderSnaps() {
  return `
    <section class="page content-page">
      <div class="section-rule" aria-hidden="true"></div>
      <header class="page-head"><p class="kicker">◷ TWO ARCHIVES</p><h1 class="page-title">SNAPS</h1><p class="page-intro">Professional model snaps first; casual looks and personal fragments underneath.</p></header>
      <div class="subsection-head"><div><p class="kicker">MODEL FILE · 001</p><h2>MODEL SNAPS</h2></div><p>Clean, current images for castings and professional reference.</p></div>
      <div class="model-snaps">${modelSnaps.map(([label, image, orientation], index) => mediaButton({ src: image, group: 'model-snaps', caption: `MODEL SNAP · ${String(index + 1).padStart(2, '0')} · ${label}`, alt: `Aurora Maximova ${label.toLowerCase()} model snap`, className: 'model-snap', label: `${String(index + 1).padStart(2, '0')} · ${label} · ZOOM +`, orientation })).join('')}</div>
      <div class="subsection-head"><div><p class="kicker">PERSONAL FILE · 002</p><h2>PERSONAL ARCHIVE</h2></div><p>A smaller, looser folder for looks, places and everyday fragments. More files can be dropped in later.</p></div>
      ${personalSnaps.length ? `<div class="polaroid-grid">${personalSnaps.map(([title, date, image, tilt, orientation], index) => `<figure class="polaroid" style="--tilt:${tilt}">${mediaButton({ src: image, group: 'personal-snaps', caption: `${title} · ${date}`, alt: title, className: 'polaroid-media', orientation })}<figcaption><strong>${title}</strong><span>${date}</span></figcaption></figure>`).join('')}</div>` : `<div class="archive-empty compact"><span class="meta-label">PERSONAL FILES · 0</span><h2>MORE SOON</h2><p>This folder is ready for the next selfies, looks, backstage and daily fragments. New files automatically use the fullscreen archive viewer.</p></div>`}
      ${footer()}
    </section>`;
}

function renderProjects() {
  return `
    <section class="page content-page">
      <div class="section-rule" aria-hidden="true"></div>
      <header class="page-head"><p class="kicker">⊞ CREATIVE RECORD</p><h1 class="page-title">PROJECTS</h1><p class="page-intro">Publications, scans, websites, interactive experiments and creative work outside conventional modeling.</p></header>
      <div class="subsection-head"><div><p class="kicker">PRESS ARCHIVE · ${publications.length}</p><h2>PUBLICATIONS</h2></div><p>Published editorials, complete scans, issue information and creative credits.</p></div>
      ${publications.map((item) => `
        <article class="publication-feature ${item.layout === 'portrait' ? 'publication-feature-portrait' : ''}">
          <div class="publication-copy">
            <div class="publication-title-lockup"><span class="publication-mark">✦ PUBLISHED WORK</span><p class="meta-label">${item.publication} · ${item.issue}</p><h3>${item.title}</h3></div>
            <div class="publication-story"><p>${item.description}</p><div class="publication-credits">${item.credits.map((credit) => `<span>${credit}</span>`).join('')}</div></div>
          </div>
          <div class="magazine-scans ${item.layout === 'portrait' ? 'magazine-scans-portrait' : ''}">
            ${item.scans.map((scan, index) => {
              const pages = item.scanPages[index];
              const pageWord = item.scanLabel === 'SPREAD' ? 'pages' : 'page';
              const orientation = item.layout === 'portrait' ? 'portrait' : safeMediaOrientation(item.scanMeta?.[index]?.orientation);
              const leadClass = item.layout !== 'portrait' && index === 0 ? 'scan-card-lead' : '';
              const portraitClass = item.layout === 'portrait' ? 'scan-card-portrait' : '';
              return `<button class="scan-card ${leadClass} ${portraitClass}" type="button" data-auto-media-card data-orientation="${orientation}" data-media-src="${scan}" data-media-group="publication-${item.slug}" data-media-caption="${item.publication} · ${item.viewerIssue} · ${item.scanLabel} ${pages}" aria-label="Open ${item.publication} ${pageWord} ${pages}"><img src="${scan}" alt="${item.publication} ${pageWord} ${pages} featuring Aurora Maximova" loading="lazy" decoding="async" /><span>OPEN ${item.scanLabel} · ${pages} ↗</span></button>`;
            }).join('')}
          </div>
        </article>`).join('')}
      <div class="subsection-head"><div><p class="kicker">⌁ PUBLIC SIGNAL · @WVEERIE</p><h2>INSTAGRAM LOG</h2></div><p>Selected public captions and confirmed creative credits from Aurora’s Instagram, paired with original portfolio files.</p></div>
      <div class="social-grid">${socialLogs.map((item, index) => `<article class="social-card">
        ${mediaButton({ src: item.image, group: 'instagram-log', caption: `${item.title} · @wveerie`, alt: `${item.title} editorial by Aurora Maximova`, className: 'social-media-button' })}
        <div class="social-copy"><span class="meta-label">${item.meta}</span><h3>${item.title}</h3><p>${item.text}</p><strong>${item.credit}</strong><a href="${item.url}" target="_blank" rel="noreferrer">VIEW PUBLIC POST →</a></div>
      </article>`).join('')}</div>
      <div class="subsection-head"><div><p class="kicker">DIGITAL WORK</p><h2>CREATIVE PROJECTS</h2></div><p>Websites, design systems, creative coding and anything else that belongs to the WVEERIE universe.</p></div>
      <div class="project-list">${digitalProjects.map((item) => `<article class="project-card"><img src="${item.image}" alt="Preview of ${item.title}" loading="lazy" decoding="async"><div class="project-copy"><span class="meta-label">${item.meta}</span><h3>${item.title}</h3><p>${item.text}</p><div class="tags">${item.tags.map((tag) => `<span>${tag}</span>`).join('')}</div></div></article>`).join('')}</div>
      ${footer()}
    </section>`;
}

function currentPath() {
  const hash = location.hash.replace(/^#/, '');
  return hash || '/home';
}

const creativeRoutes = new Set(['/home', '/portfolio', '/artwork', '/snaps', '/projects']);
const techRoutes = new Set(['/tech', '/tech/about', '/tech/experience', '/tech/skills', '/tech/education', '/tech/contact']);

function isKnownRoute(path, side) {
  if (side === 'tech') return techRoutes.has(path);
  if (creativeRoutes.has(path)) return true;
  const shootMatch = path.match(/^\/shoot\/([^/]+)$/);
  return Boolean(shootMatch && shoots.some((shoot) => shoot.slug === shootMatch[1]));
}

function destinationForSide(side) {
  const requestedPath = currentPath();
  return isKnownRoute(requestedPath, side) ? requestedPath : side === 'tech' ? '/tech' : '/home';
}

function navigate(route) {
  const target = `#${route}`;
  if (location.hash === target) renderRoute();
  else location.hash = target;
}

function setActiveNav(path) {
  const activeRoute = path.startsWith('/shoot/') ? '/portfolio' : path;
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.classList.toggle('active', button.dataset.route === activeRoute);
  });
}

function renderRoute() {
  const path = currentPath();
  const routeSide = path.startsWith('/tech') ? 'tech' : 'creative';
  if (!isKnownRoute(path, routeSide)) {
    navigate(path.startsWith('/shoot/') ? '/portfolio' : routeSide === 'tech' ? '/tech' : '/home');
    return;
  }
  if (routeSide !== activePortfolioSide) applyPortfolioSide(routeSide);
  let markup;
  if (path.startsWith('/tech')) markup = renderTechPortfolio();
  else if (path === '/portfolio') markup = renderPortfolio();
  else if (path.startsWith('/shoot/')) markup = renderShoot(path.split('/')[2]);
  else if (path === '/artwork') markup = renderArtwork();
  else if (path === '/snaps') markup = renderSnaps();
  else if (path === '/projects') markup = renderProjects();
  else markup = renderHome();

  if (!path.startsWith('/shoot/')) document.title = path.startsWith('/tech') ? 'WVEERIE.SYS — Aurora Maximova' : 'WVEERIE — Aurora Maximova';
  view.innerHTML = markup;
  initAdaptiveMedia();
  setActiveNav(path);
  window.scrollTo({ top: 0, behavior: 'instant' });
  closeMenu();
  initReveals();
  recordAction('visit', path.startsWith('/shoot/') ? '/portfolio' : path);
  if (path.startsWith('/shoot/')) recordAction('series', path.split('/')[2]);
  if (path.startsWith('/tech/')) {
    const target = document.querySelector(`#tech-${path.split('/')[2]}`);
    const scrollToTarget = () => target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    requestAnimationFrame(() => requestAnimationFrame(scrollToTarget));
    document.fonts?.ready.then(scrollToTarget).catch(() => {});
  }
}

let revealObserver;
function initReveals() {
  revealObserver?.disconnect();
  const targets = view.querySelectorAll('.shoot-card, .model-snap, .project-card, .publication-feature, .social-card, .archive-empty, .shoot-gallery figure, .subsection-head, .tech-log-card, .education-card, .tech-principles article, .tech-section-head, .tech-about-copy, .tech-about-notes > div');
  targets.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 65}ms`);
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
  targets.forEach((item) => revealObserver.observe(item));
}

function openMenu() {
  if (!mobileNavigationQuery.matches) return;
  sidebar.classList.add('open');
  document.body.classList.add('menu-open');
  sidebar.inert = false;
  sidebar.removeAttribute('aria-hidden');
  menuToggle?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  sidebar.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (mobileNavigationQuery.matches) {
    if (sidebar.contains(document.activeElement)) menuToggle?.focus({ preventScroll: true });
    sidebar.inert = true;
    sidebar.setAttribute('aria-hidden', 'true');
  } else {
    sidebar.inert = false;
    sidebar.removeAttribute('aria-hidden');
  }
}

mobileNavigationQuery.addEventListener?.('change', () => closeMenu());
closeMenu();

function openPanel(name) {
  const panels = { about: aboutPanel, contact: contactPanel, quests: questPanel };
  const panel = panels[name] || contactPanel;
  panelFocusReturnTarget = document.activeElement;
  hideToast(true);
  Object.values(panels).forEach((item) => { item.hidden = item !== panel; });
  backdrop.hidden = false;
  panel.hidden = false;
  document.body.style.overflow = 'hidden';
  closeMenu();
  syncPageInert();
  recordAction('panel', name);
  panel.querySelector('[data-close-panel]').focus();
}

function closePanels() {
  const hadOpenPanel = [aboutPanel, contactPanel, questPanel].some((panel) => !panel.hidden);
  [aboutPanel, contactPanel, questPanel].forEach((panel) => { panel.hidden = true; });
  backdrop.hidden = true;
  if (scanLightbox.hidden) document.body.style.overflow = '';
  syncPageInert();
  if (hadOpenPanel) restoreFocus(panelFocusReturnTarget);
  panelFocusReturnTarget = null;
}

let activeMediaItems = [];
let activeMediaIndex = 0;

function showActiveMedia() {
  if (!activeMediaItems.length) return;
  activeMediaIndex = (activeMediaIndex + activeMediaItems.length) % activeMediaItems.length;
  const item = activeMediaItems[activeMediaIndex];
  scanImage.src = item.src;
  scanImage.alt = item.alt || item.caption;
  scanCaption.textContent = `${item.caption} · ${activeMediaIndex + 1} / ${activeMediaItems.length}`;
  const hasMultiple = activeMediaItems.length > 1;
  scanLightbox.querySelector('[data-scan-prev]').hidden = !hasMultiple;
  scanLightbox.querySelector('[data-scan-next]').hidden = !hasMultiple;
}

function openMedia(button) {
  mediaFocusReturnTarget = document.activeElement;
  hideToast(true);
  const group = button.dataset.mediaGroup;
  const buttons = [...document.querySelectorAll('[data-media-src]')].filter((item) => item.dataset.mediaGroup === group);
  activeMediaItems = buttons.map((item) => ({
    src: item.dataset.mediaSrc,
    caption: item.dataset.mediaCaption || 'WVEERIE ARCHIVE',
    alt: item.querySelector('img')?.alt || item.dataset.mediaCaption,
  }));
  activeMediaIndex = Math.max(0, buttons.indexOf(button));
  showActiveMedia();
  scanLightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  syncPageInert();
  recordAction('media');
  scanLightbox.querySelector('[data-close-scan]').focus();
}

function closeMedia() {
  const wasOpen = !scanLightbox.hidden;
  scanLightbox.hidden = true;
  if (aboutPanel.hidden && contactPanel.hidden && questPanel.hidden) document.body.style.overflow = '';
  syncPageInert();
  if (wasOpen) restoreFocus(mediaFocusReturnTarget);
  mediaFocusReturnTarget = null;
}

let toastTimer;
let toastHideTimer;
let toastFrame;

function hideToast(immediate = false) {
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);
  cancelAnimationFrame(toastFrame);
  toast.classList.remove('is-visible');
  if (toast.hidden) return;
  if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    toast.hidden = true;
    return;
  }
  toastHideTimer = setTimeout(() => { toast.hidden = true; }, 380);
}

function showToast(message) {
  if (!aboutPanel.hidden || !contactPanel.hidden || !questPanel.hidden || !scanLightbox.hidden) return;
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);
  cancelAnimationFrame(toastFrame);
  toastCopy.textContent = message;
  const wasHidden = toast.hidden;
  toast.hidden = false;
  if (wasHidden) {
    toast.classList.remove('is-visible');
    toastFrame = requestAnimationFrame(() => {
      toastFrame = requestAnimationFrame(() => toast.classList.add('is-visible'));
    });
  } else {
    toast.classList.add('is-visible');
  }
  toastTimer = setTimeout(() => hideToast(), 4500);
}

let introFrameRequest = 0;
let introStartedAt = 0;
let introExitStartedAt = 0;
let introPausedAt = 0;
let introIsExiting = false;
let introMode = 'idle';
let introGameActive = false;
let introPrologueActive = true;
let introReturnTarget = 'chooser';
let runnerPlaying = false;
let runnerMoving = false;
let runnerHp = 3;
let runnerScore = 0;
let runnerBonus = 0;
let runnerBestScore = 0;
let runnerLastFrameAt = 0;
let runnerSpawnDistance = 720;
let runnerDistance = 0;
let runnerWorldOffset = 0;
let runnerIsAirborne = false;
let runnerJumpStartedAt = 0;
let runnerJumpTimer = 0;
let runnerRunHeld = false;
let runnerJumpAutoStop = false;
let runnerQueuedJumpUntil = 0;
let runnerQueuedJumpAutoStop = false;
let runnerDuckHeld = false;
let runnerLastActionAt = 0;
let runnerIdleAction = null;
let runnerNextIdleActionAt = 0;
let runnerIdleSequence = 0;
let runnerEntities = [];
let runnerHudSnapshot = '';
let currentWorldDistance = 0;
const RUNNER_JUMP_BUFFER_MS = 220;
const CITY_LOOP_ASPECT = 3762 / 836;
const RUNNER_BEST_KEY = 'wveerie-runner-best-v3';
const runnerEntityTypes = [
  { kind: 'vent', src: 'assets/game/v3/props/vent.png', danger: true, weight: 2 },
  { kind: 'chimney', src: 'assets/game/v3/props/chimney.png', danger: true, weight: 2 },
  { kind: 'planter', src: 'assets/game/v3/props/planter.png', danger: true, weight: 2 },
  { kind: 'cable', src: 'assets/game/v3/props/cable.png', danger: true, weight: 2 },
  { kind: 'masonry', src: 'assets/game/v3/props/masonry.png', danger: true, weight: 1 },
  { kind: 'heart', src: 'assets/game/sprites/props/heart.png', danger: false, heal: true, weight: 1 },
  { kind: 'sparkle', src: 'assets/game/sprites/props/sparkle.png', danger: false, bonus: 300, weight: 2 },
];

function readRunnerBest() {
  try {
    const value = Number(localStorage.getItem(RUNNER_BEST_KEY));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function saveRunnerBest() {
  runnerBestScore = Math.max(runnerBestScore, runnerScore);
  try {
    localStorage.setItem(RUNNER_BEST_KEY, String(runnerBestScore));
  } catch {
    // The runner still works when browser storage is unavailable.
  }
}

function formatRunnerScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(5, '0').slice(-5);
}

function updateRunnerHud() {
  const snapshot = `${runnerHp}:${runnerScore}:${runnerBestScore}`;
  if (snapshot === runnerHudSnapshot) return;
  runnerHudSnapshot = snapshot;
  introScore.textContent = formatRunnerScore(runnerScore);
  introBest.textContent = formatRunnerScore(Math.max(runnerBestScore, runnerScore));
  introHpHearts.textContent = `${'♥ '.repeat(runnerHp)}${'♡ '.repeat(3 - runnerHp)}`.trim();
  introHpHearts.setAttribute('aria-label', `${runnerHp} of 3 health points`);
  introHpCopy.textContent = `${runnerHp}/3`;
  introHpFill.style.width = `${(runnerHp / 3) * 100}%`;
}

function setIntroWorldPosition(distance = currentWorldDistance) {
  if (!roniaIntro) return;
  currentWorldDistance = Math.max(0, Number(distance) || 0);
  const cityLoopWidth = Math.max(1, window.innerHeight * CITY_LOOP_ASPECT);
  const nearShift = -((currentWorldDistance * 1.55) % 390);
  const cityShift = -((currentWorldDistance * .36) % cityLoopWidth);
  roniaIntro.style.setProperty('--world-near-x', `${nearShift}px`);
  roniaIntro.style.setProperty('--city-loop-width', `${cityLoopWidth}px`);
  roniaIntro.style.setProperty('--city-x', `${cityShift}px`);
}

function removeRunnerEntities() {
  runnerEntities.forEach(({ element }) => element.remove());
  runnerEntities = [];
}

function chooseRunnerEntity() {
  const total = runnerEntityTypes.reduce((sum, item) => sum + item.weight, 0);
  let pick = Math.random() * total;
  return runnerEntityTypes.find((item) => ((pick -= item.weight) <= 0)) || runnerEntityTypes[0];
}

function spawnRunnerEntity(now) {
  if (!introWorld) return;
  const type = chooseRunnerEntity();
  const element = document.createElement('img');
  element.className = `intro-entity is-${type.kind} ${type.danger ? 'is-obstacle' : 'is-reward'}`;
  element.src = type.src;
  element.alt = '';
  element.draggable = false;
  introWorld.append(element);
  const width = element.getBoundingClientRect().width || 80;
  runnerEntities.push({
    element,
    type,
    x: window.innerWidth + 100,
    width,
    collided: false,
  });
  runnerSpawnDistance = Math.max(420, 760 - runnerScore * .18) + Math.random() * 330;
}

function collectRunnerEntity(entity) {
  if (entity.collided) return;
  entity.collided = true;
  if (entity.type.danger) {
    runnerHp = Math.max(0, runnerHp - 1);
    roniaIntro.classList.remove('runner-hit');
    void roniaIntro.offsetWidth;
    roniaIntro.classList.add('runner-hit');
    if (navigator.vibrate) navigator.vibrate(45);
  } else if (entity.type.heal) {
    runnerHp = Math.min(3, runnerHp + 1);
    runnerBonus += 200;
    introHint.textContent = runnerHp === 3 ? 'Full hearts! +200 ♡' : 'Heart restored! +200 ♡';
  } else {
    runnerBonus += entity.type.bonus || 100;
    introHint.textContent = `Sparkle collected! +${entity.type.bonus || 100} ✦`;
  }
  entity.element.remove();
  runnerEntities = runnerEntities.filter((item) => item !== entity);
  updateRunnerHud();
  if (runnerHp <= 0) endRunnerGame();
}

function updateRunner(now) {
  if (!runnerPlaying) return;
  const delta = Math.min(40, Math.max(0, now - runnerLastFrameAt)) / 1000;
  runnerLastFrameAt = now;
  if (!runnerMoving) {
    updateRunnerHud();
    return;
  }

  const worldSpeed = Math.min(510, 285 + runnerScore * .045);
  const travelled = worldSpeed * delta;
  runnerDistance += travelled;
  runnerWorldOffset += travelled;
  runnerSpawnDistance -= travelled;
  runnerScore = Math.floor(runnerDistance / 11) + runnerBonus;
  setIntroWorldPosition(runnerWorldOffset);
  if (runnerSpawnDistance <= 0) spawnRunnerEntity(now);

  const playerHitX = window.innerWidth * (window.innerWidth <= 760 ? .38 : .3);
  [...runnerEntities].forEach((entity) => {
    entity.x -= travelled;
    entity.element.style.transform = `translate3d(${entity.x}px,0,0)`;
    const entityCenter = entity.x + entity.width * .5;
    const crossedPlayer = entityCenter < playerHitX + 54 && entityCenter > playerHitX - 54;
    const canCollide = !entity.type.danger || !runnerIsAirborne;
    if (!entity.collided && crossedPlayer && canCollide) collectRunnerEntity(entity);
    if (entity.x < -140) {
      entity.element.remove();
      runnerEntities = runnerEntities.filter((item) => item !== entity);
    }
  });
  updateRunnerHud();
}

function finishRunnerJump(now = performance.now()) {
  if (!runnerIsAirborne) return;
  const shouldAutoStop = runnerJumpAutoStop;
  const shouldChainJump = runnerPlaying && !runnerDuckHeld && runnerQueuedJumpUntil >= now;
  const chainedAutoStop = shouldAutoStop || runnerQueuedJumpAutoStop;
  clearTimeout(runnerJumpTimer);
  runnerJumpTimer = 0;
  runnerIsAirborne = false;
  runnerJumpAutoStop = false;
  runnerQueuedJumpUntil = 0;
  runnerQueuedJumpAutoStop = false;
  introRonia.classList.remove('runner-airborne');
  introRonia.style.removeProperty('bottom');
  introCats.style.removeProperty('bottom');
  if (shouldChainJump) {
    jumpRunner({ autoStop: chainedAutoStop });
    return;
  }
  if (shouldAutoStop && !runnerRunHeld) setRunnerMoving(false);
}

function jumpRunner({ autoStop = false } = {}) {
  if (!runnerPlaying || runnerDuckHeld) return false;
  if (runnerIsAirborne) {
    const now = performance.now();
    if (runnerQueuedJumpUntil < now) runnerQueuedJumpAutoStop = false;
    runnerQueuedJumpUntil = now + RUNNER_JUMP_BUFFER_MS;
    runnerQueuedJumpAutoStop ||= autoStop;
    return false;
  }
  clearTimeout(runnerJumpTimer);
  runnerIsAirborne = true;
  runnerJumpAutoStop = autoStop;
  runnerQueuedJumpUntil = 0;
  runnerQueuedJumpAutoStop = false;
  runnerJumpStartedAt = performance.now();
  markRunnerAction(runnerJumpStartedAt);
  introRonia.classList.remove('runner-airborne');
  void introRonia.offsetWidth;
  introRonia.classList.add('runner-airborne');
  runnerJumpTimer = setTimeout(() => finishRunnerJump(), INTRO_TIMING.jumpDuration + 80);
  return true;
}

function endRunnerGame() {
  if (!runnerPlaying) return;
  runnerPlaying = false;
  runnerMoving = false;
  clearTimeout(runnerJumpTimer);
  runnerJumpTimer = 0;
  roniaIntro.classList.remove('world-moving');
  runnerIsAirborne = false;
  runnerRunHeld = false;
  runnerJumpAutoStop = false;
  runnerQueuedJumpUntil = 0;
  runnerQueuedJumpAutoStop = false;
  introRonia.classList.remove('runner-airborne');
  introRonia.style.removeProperty('bottom');
  introCats.style.removeProperty('bottom');
  saveRunnerBest();
  updateRunnerHud();
  introFinalScore.textContent = formatRunnerScore(runnerScore);
  introGameover.hidden = false;
  roniaIntro.classList.add('game-over');
  introHint.textContent = 'Tap TRY AGAIN to keep running ♡';
  setIntroMode('idle');
}

function startRunnerGame({ moving = false } = {}) {
  if (!roniaIntro) return;
  removeRunnerEntities();
  runnerHp = 3;
  runnerScore = 0;
  runnerBonus = 0;
  runnerDistance = 0;
  runnerWorldOffset = 0;
  runnerPlaying = true;
  runnerMoving = moving;
  clearTimeout(runnerJumpTimer);
  runnerJumpTimer = 0;
  runnerIsAirborne = false;
  runnerRunHeld = false;
  runnerJumpAutoStop = false;
  runnerQueuedJumpUntil = 0;
  runnerQueuedJumpAutoStop = false;
  runnerDuckHeld = false;
  runnerIdleAction = null;
  introRonia.style.removeProperty('bottom');
  introCats.style.removeProperty('bottom');
  introGameActive = true;
  introPrologueActive = false;
  introIsExiting = false;
  const now = performance.now();
  introStartedAt = now;
  runnerLastFrameAt = now;
  runnerSpawnDistance = 720;
  runnerLastActionAt = now;
  runnerNextIdleActionAt = now + 4800;
  setIntroWorldPosition(0);
  introGameover.hidden = true;
  roniaIntro.classList.remove('is-hidden', 'is-ending', 'is-jumping', 'runner-hit', 'game-over');
  roniaIntro.classList.add('game-playing');
  roniaIntro.dataset.session = 'game';
  roniaIntro.classList.toggle('world-moving', moving);
  roniaIntro.hidden = false;
  roniaIntro.setAttribute('aria-hidden', 'false');
  document.body.classList.add('intro-open');
  syncPageInert();
  document.querySelector('[data-intro-enter] strong').textContent = 'EXIT TO THE ARCHIVE';
  introHint.textContent = 'HOLD → TO RUN · SPACE / ↑ TO JUMP · ↓ TO DUCK · ← TO STOP';
  setIntroMode(moving ? 'run' : 'idle');
  updateRunnerHud();
  cancelAnimationFrame(introFrameRequest);
  introFrameRequest = requestAnimationFrame(animateIntro);
  requestAnimationFrame(() => roniaIntro.focus?.({ preventScroll: true }));
}

function openRoniaGame() {
  closePanels();
  closeMedia();
  closeMenu();
  introReturnTarget = 'archive';
  runnerBestScore = readRunnerBest();
  startRunnerGame();
}

function setIntroFrame(image, frames, elapsed, duration, once = false) {
  if (!image || !frames.length) return;
  const rawIndex = Math.floor(Math.max(0, elapsed) / duration);
  const index = once ? Math.min(frames.length - 1, rawIndex) : rawIndex % frames.length;
  if (image.dataset.frame === String(index)) return;
  const nextSource = frames[index];
  const cachedFrame = preloadIntroFrame(nextSource);
  if (!cachedFrame.ready && cachedFrame.image.complete && cachedFrame.image.naturalWidth) cachedFrame.ready = true;
  if (!cachedFrame.ready) return;
  const previousSource = image.getAttribute('src');
  const ghost = introSpriteGhosts.get(image.id);
  const shouldBlendIdle = image === introRonia
    && introMode === 'idle'
    && previousSource?.includes('/ronia/idle/')
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ghost && previousSource && previousSource !== nextSource && shouldBlendIdle) {
    introSpriteFades.get(ghost)?.cancel();
    ghost.src = previousSource;
    const fade = ghost.animate(
      [{ opacity: .12 }, { opacity: 0 }],
      {
        duration: 78,
        easing: 'linear',
        fill: 'forwards',
      },
    );
    introSpriteFades.set(ghost, fade);
  } else if (ghost) {
    introSpriteFades.get(ghost)?.cancel();
  }
  image.dataset.frame = String(index);
  image.src = nextSource;
}

function markRunnerAction(now = performance.now()) {
  runnerLastActionAt = now;
  runnerIdleAction = null;
  runnerNextIdleActionAt = now + 4800;
}

function setRunnerMoving(moving) {
  const next = Boolean(moving && runnerPlaying && !runnerDuckHeld);
  if (runnerMoving === next) return;
  runnerMoving = next;
  markRunnerAction();
  roniaIntro.classList.toggle('world-moving', next);
  introHint.textContent = next
    ? 'SPACE / ↑ TO JUMP · ↓ TO DUCK · release → or press ← to stop'
    : 'PAUSED — HOLD → TO RUN · everyone waits when you wait ♡';
}

function beginRunnerIdleAction(now) {
  runnerIdleAction = {
    type: 'pet',
    startedAt: now,
    duration: 3600,
  };
  runnerIdleSequence += 1;
}

function setIntroMode(mode) {
  if (!roniaIntro) return;
  const changed = introMode !== mode || roniaIntro.dataset.mode !== mode;
  introMode = mode;
  roniaIntro.dataset.mode = mode;
  introRonia.hidden = false;
  introCats.hidden = false;
  introPetScene.hidden = false;
  if (changed) {
    [introRonia, introCats, introPetScene].forEach((image) => { image.dataset.frame = ''; });
    introSpriteGhosts.forEach((ghost) => {
      introSpriteFades.get(ghost)?.cancel();
      ghost.getAnimations().forEach((animation) => animation.cancel());
    });
  }
}

function animateRunnerIdle(now) {
  if (!runnerLastActionAt) runnerLastActionAt = now;
  if (!runnerNextIdleActionAt) runnerNextIdleActionAt = now + 4800;
  if (!runnerIdleAction && now >= runnerNextIdleActionAt) beginRunnerIdleAction(now);

  if (runnerIdleAction) {
    const phase = now - runnerIdleAction.startedAt;
    if (phase >= runnerIdleAction.duration) {
      runnerIdleAction = null;
      runnerLastActionAt = now;
      runnerNextIdleActionAt = now + 5600 + Math.random() * 1900;
    } else {
      setIntroMode('pet');
      setIntroFrame(introPetScene, introAnimations.petScene, phase, INTRO_TIMING.pet);
      return;
    }
  }

  const idleElapsed = now - runnerLastActionAt;
  setIntroMode('idle');
  setIntroFrame(introRonia, introAnimations.idle, idleElapsed, INTRO_TIMING.idle);
  setIntroFrame(introCats, introAnimations.catsIdle, idleElapsed + 37, INTRO_TIMING.catsIdle);
}

function animateIntro(now) {
  introFrameRequest = 0;
  if (!roniaIntro || roniaIntro.hidden || document.hidden) return;
  if (!introStartedAt) introStartedAt = now;
  const elapsed = now - introStartedAt;

  if (introIsExiting) {
    const jumpElapsed = now - introExitStartedAt;
    const exitProgress = Math.min(1, Math.max(0, jumpElapsed / INTRO_TIMING.jumpDuration));
    const exitArc = 4 * exitProgress * (1 - exitProgress);
    setIntroMode('jump');
    introRonia.style.bottom = `${16.5 + exitArc * 24}%`;
    introCats.style.bottom = `${18.2 + exitArc * 24}%`;
    setIntroFrame(introRonia, introAnimations.jump, jumpElapsed, INTRO_TIMING.jump, true);
    setIntroFrame(introCats, introAnimations.catsJump, jumpElapsed, INTRO_TIMING.jump, true);
  } else if (introGameActive) {
    if (runnerPlaying) {
      if (runnerIsAirborne && now - runnerJumpStartedAt >= INTRO_TIMING.jumpDuration) finishRunnerJump(now);
      updateRunner(now);
      if (runnerIsAirborne) {
        setIntroMode('jump');
        const jumpProgress = Math.min(1, Math.max(0, (now - runnerJumpStartedAt) / INTRO_TIMING.jumpDuration));
        const jumpArc = 4 * jumpProgress * (1 - jumpProgress);
        introRonia.style.bottom = `${16.5 + jumpArc * 24.5}%`;
        introCats.style.bottom = `${18.2 + jumpArc * 24.5}%`;
        setIntroFrame(introRonia, introAnimations.jump, now - runnerJumpStartedAt, INTRO_TIMING.jump, true);
        setIntroFrame(introCats, introAnimations.catsJump, now - runnerJumpStartedAt, INTRO_TIMING.jump, true);
      } else if (runnerDuckHeld) {
        introRonia.style.removeProperty('bottom');
        introCats.style.removeProperty('bottom');
        setIntroMode('duck');
        setIntroFrame(introRonia, introAnimations.jump, 0, 100, true);
        setIntroFrame(introCats, runnerMoving ? introAnimations.catsRun : introAnimations.catsIdle, runnerMoving ? runnerDistance * 3.4 : now, 90);
      } else if (runnerMoving) {
        introRonia.style.removeProperty('bottom');
        introCats.style.removeProperty('bottom');
        setIntroMode('run');
        setIntroFrame(introRonia, introAnimations.run, runnerDistance * 3.4, INTRO_TIMING.run);
        setIntroFrame(introCats, introAnimations.catsRun, runnerDistance * 3.4 + 32, INTRO_TIMING.catsRun);
      } else {
        introRonia.style.removeProperty('bottom');
        introCats.style.removeProperty('bottom');
        animateRunnerIdle(now);
      }
    } else {
      animateRunnerIdle(now);
    }
  } else if (introPrologueActive) {
    const worldOffset = elapsed * .105;
    const cycle = elapsed % 6200;
    roniaIntro.classList.add('world-moving');
    setIntroWorldPosition(worldOffset);
    if (cycle >= 2500 && cycle < 2500 + INTRO_TIMING.jumpDuration) {
      const progress = (cycle - 2500) / INTRO_TIMING.jumpDuration;
      const arc = 4 * progress * (1 - progress);
      setIntroMode('jump');
      introRonia.style.bottom = `${16.5 + arc * 24}%`;
      introCats.style.bottom = `${18.2 + arc * 24}%`;
      setIntroFrame(introRonia, introAnimations.jump, cycle - 2500, INTRO_TIMING.jump, true);
      setIntroFrame(introCats, introAnimations.catsJump, cycle - 2500, INTRO_TIMING.jump, true);
    } else {
      introRonia.style.removeProperty('bottom');
      introCats.style.removeProperty('bottom');
      setIntroMode('run');
      setIntroFrame(introRonia, introAnimations.run, elapsed, INTRO_TIMING.run);
      setIntroFrame(introCats, introAnimations.catsRun, elapsed + 24, INTRO_TIMING.catsRun);
    }
  } else {
    animateRunnerIdle(now);
  }
  introFrameRequest = requestAnimationFrame(animateIntro);
}

function buildIntroPixelWipe() {
  if (!introPixelWipe || introPixelWipe.childElementCount) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 126; index += 1) {
    const pixel = document.createElement('span');
    const row = Math.floor(index / 14);
    const column = index % 14;
    const distance = Math.abs(column - 7) + Math.abs(row - 4);
    pixel.style.setProperty('--pixel-delay', `${Math.max(0, 235 - distance * 18 + (index % 4) * 13)}ms`);
    fragment.append(pixel);
  }
  introPixelWipe.append(fragment);
}

function showSideSelect() {
  if (!sideSelect) return;
  sideSelect.hidden = false;
  sideSelect.setAttribute('aria-hidden', 'false');
  sideSelect.classList.remove('is-leaving');
  document.body.classList.add('side-select-open');
  syncPageInert();
  requestAnimationFrame(() => {
    sideSelect.classList.add('is-visible');
    sideSelect.focus({ preventScroll: true });
  });
}

function choosePortfolioSide(side) {
  if (!sideSelect || sideSelect.hidden) return;
  const nextSide = side === 'tech' ? 'tech' : 'creative';
  const destination = destinationForSide(nextSide);
  sideSelect.dataset.selected = nextSide;
  sideSelect.classList.add('is-leaving');
  switchPortfolioSide(nextSide, { destination, fromChooser: true });
}

function completeIntro() {
  if (!roniaIntro || roniaIntro.hidden) return;
  const shouldChooseSide = introReturnTarget === 'chooser';
  runnerPlaying = false;
  runnerMoving = false;
  roniaIntro.classList.remove('world-moving');
  if (introGameActive) saveRunnerBest();
  roniaMusic?.pause();
  if (shouldChooseSide) showSideSelect();
  roniaIntro.classList.add('is-hidden');
  document.body.classList.remove('intro-open');
  setTimeout(() => {
    roniaIntro.hidden = true;
    roniaIntro.setAttribute('aria-hidden', 'true');
    cancelAnimationFrame(introFrameRequest);
    introFrameRequest = 0;
    removeRunnerEntities();
    introGameActive = false;
    introPrologueActive = false;
    introGameover.hidden = true;
    roniaIntro.classList.remove('game-playing', 'world-moving', 'runner-hit', 'game-over');
    introRonia.style.removeProperty('bottom');
    introCats.style.removeProperty('bottom');
    document.querySelector('[data-intro-enter] strong').textContent = 'ENTER THE ARCHIVE';
    syncPageInert();
    if (!shouldChooseSide) {
      view.focus({ preventScroll: true });
      showToast('Welcome back. Your selected side is still connected ♡');
    }
  }, 480);
}

function enterFromIntro({ skip = false } = {}) {
  if (!roniaIntro || roniaIntro.hidden || introIsExiting) return;
  clearTimeout(runnerJumpTimer);
  runnerJumpTimer = 0;
  runnerQueuedJumpUntil = 0;
  runnerQueuedJumpAutoStop = false;
  runnerPlaying = false;
  runnerMoving = false;
  roniaIntro.classList.remove('world-moving');
  if (introGameActive) saveRunnerBest();
  introPrologueActive = false;
  introIsExiting = true;
  introExitStartedAt = performance.now();
  roniaIntro.classList.add('is-jumping');
  if (skip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    completeIntro();
    return;
  }
  buildIntroPixelWipe();
  setTimeout(() => roniaIntro.classList.add('is-ending'), 500);
  setTimeout(completeIntro, 1120);
}

async function toggleIntroMusic() {
  if (!roniaMusic || !introMusicButton) return;
  const source = roniaMusic.dataset.src?.trim();
  if (!source) {
    introHint.textContent = 'Music slot is ready — we will add your cute track here soon ♫';
    return;
  }
  if (!roniaMusic.getAttribute('src')) roniaMusic.src = source;
  if (roniaMusic.paused) {
    try {
      await roniaMusic.play();
      introMusicButton.textContent = '♫ MUSIC ON';
      introMusicButton.setAttribute('aria-pressed', 'true');
    } catch {
      introHint.textContent = 'Tap the music button once more to start the track ♫';
    }
  } else {
    roniaMusic.pause();
    introMusicButton.textContent = '♫ MUSIC OFF';
    introMusicButton.setAttribute('aria-pressed', 'false');
  }
}

function initRoniaIntro() {
  if (!roniaIntro) return;
  introReturnTarget = 'chooser';
  runnerBestScore = readRunnerBest();
  runnerHp = 3;
  runnerScore = 0;
  runnerMoving = false;
  introGameActive = false;
  introPrologueActive = true;
  introStartedAt = performance.now();
  runnerLastActionAt = performance.now();
  runnerNextIdleActionAt = runnerLastActionAt + 4800;
  setIntroWorldPosition(0);
  updateRunnerHud();
  document.body.classList.add('intro-open');
  syncPageInert();
  roniaIntro.dataset.mode = 'run';
  roniaIntro.dataset.session = 'prologue';
  [introRonia, introCats, introPetScene].forEach((image) => { image.hidden = false; });
  roniaIntro.addEventListener('pointerdown', (event) => {
    if (!introGameActive || !runnerPlaying || introIsExiting) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('button, a, [role="button"]')) return;
    event.preventDefault();
    const autoStop = !runnerRunHeld && !runnerMoving;
    setRunnerMoving(true);
    jumpRunner({ autoStop });
  });
  roniaIntro.addEventListener('click', (event) => {
    if (event.target.closest('[data-run-control]')) return;
    if (event.target.closest('[data-intro-music]')) {
      toggleIntroMusic();
      return;
    }
    if (event.target.closest('[data-intro-retry]')) {
      startRunnerGame();
      return;
    }
    if (event.target.closest('[data-intro-exit]') || event.target.closest('[data-intro-enter]') || event.target.closest('[data-intro-skip]')) {
      enterFromIntro({ skip: Boolean(event.target.closest('[data-intro-skip]')) });
      return;
    }
    if (introPrologueActive) {
      enterFromIntro();
      return;
    }
  });
  requestAnimationFrame(() => document.querySelector('[data-intro-enter]')?.focus({ preventScroll: true }));
  if (!document.hidden) introFrameRequest = requestAnimationFrame(animateIntro);
}

function useIntroControl(control) {
  if (!control || !roniaIntro || roniaIntro.hidden) return;
  const action = control.dataset.runControl;
  if (action === 'stop') {
    runnerRunHeld = false;
    setRunnerMoving(false);
    return;
  }
  const wasMoving = runnerMoving;
  if (!introGameActive || !runnerPlaying) startRunnerGame({ moving: action === 'run' });
  if (action === 'run') {
    runnerRunHeld = true;
    setRunnerMoving(true);
  }
  if (action === 'jump') {
    const autoStop = !runnerRunHeld && !wasMoving;
    setRunnerMoving(true);
    jumpRunner({ autoStop });
  }
}

document.querySelectorAll('[data-run-control]').forEach((control) => {
  control.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    useIntroControl(control);
    try {
      control.setPointerCapture?.(event.pointerId);
    } catch {
      // The action has already happened even if this browser declines pointer capture.
    }
  });
  if (control.dataset.runControl === 'run') {
    const stopHolding = () => {
      runnerRunHeld = false;
      setRunnerMoving(false);
    };
    control.addEventListener('pointerup', stopHolding);
    control.addEventListener('pointercancel', stopHolding);
    control.addEventListener('lostpointercapture', stopHolding);
  }
  control.addEventListener('click', (event) => {
    if (event.detail === 0) useIntroControl(control);
  });
});

document.addEventListener('click', (event) => {
  const skipContent = event.target.closest('[data-skip-content]');
  const sideChoice = event.target.closest('[data-choose-side]');
  const routeButton = event.target.closest('[data-route]');
  const shootButton = event.target.closest('[data-shoot]');
  const panelButton = event.target.closest('[data-panel]');
  const mediaButtonTarget = event.target.closest('[data-media-src]');
  const playRoniaButton = event.target.closest('[data-play-ronia]');
  if (skipContent) {
    event.preventDefault();
    view.focus({ preventScroll: true });
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (sideChoice) choosePortfolioSide(sideChoice.dataset.chooseSide);
  if (routeButton) navigate(routeButton.dataset.route);
  if (shootButton) navigate(`/shoot/${shootButton.dataset.shoot}`);
  if (panelButton) openPanel(panelButton.dataset.panel);
  if (mediaButtonTarget) openMedia(mediaButtonTarget);
  if (playRoniaButton) openRoniaGame();
  if (event.target.closest('[data-close-panel]') || event.target === backdrop) closePanels();
  if (event.target.closest('[data-close-scan]') || event.target === scanLightbox) closeMedia();
  if (event.target.closest('[data-scan-prev]')) { activeMediaIndex -= 1; showActiveMedia(); }
  if (event.target.closest('[data-scan-next]')) { activeMediaIndex += 1; showActiveMedia(); }
  if (event.target.closest('[data-save-point]')) {
    saveGame();
    showToast('Game saved locally. Your archive progress is safe ♡');
  }
  if (event.target.closest('[data-side-toggle]')) togglePortfolioSide();
  if (sidebar.classList.contains('open') && !event.target.closest('#sidebar, #menu-toggle')) closeMenu();

  if (!event.target.closest('#ronia-intro, #side-select') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && event.clientX && event.clientY) {
    const sparkle = document.createElement('span');
    sparkle.className = 'click-sparkle';
    sparkle.textContent = ['✦', '♡', '⋆'][Math.floor(Math.random() * 3)];
    sparkle.style.left = `${event.clientX}px`;
    sparkle.style.top = `${event.clientY}px`;
    document.body.append(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
  }
});

sideSelect?.querySelectorAll('[data-choose-side]').forEach((button) => {
  const lookToSide = () => {
    sideSelect.dataset.focus = button.dataset.chooseSide;
  };
  const resetSideFocus = () => {
    sideSelect.removeAttribute('data-focus');
  };
  button.addEventListener('pointerenter', lookToSide);
  button.addEventListener('pointerleave', resetSideFocus);
  button.addEventListener('focus', lookToSide);
  button.addEventListener('blur', resetSideFocus);
});

menuToggle?.addEventListener('click', () => sidebar.classList.contains('open') ? closeMenu() : openMenu());
document.querySelector('#toast-close').addEventListener('click', () => hideToast());
window.addEventListener('hashchange', renderRoute);

document.addEventListener('keydown', (event) => {
  if (sideSelect && !sideSelect.hidden) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const side = event.key === 'ArrowLeft' ? 'tech' : 'creative';
      sideSelect.querySelector(`[data-choose-side="${side}"]`)?.focus();
    }
    return;
  }
  if (roniaIntro && !roniaIntro.hidden) {
    if (event.target.closest('button') && ['Enter', ' '].includes(event.key)) return;
    if (introPrologueActive) {
      if (['Enter', ' ', 'Escape'].includes(event.key)) {
        event.preventDefault();
        enterFromIntro({ skip: event.key === 'Escape' });
      }
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (!introGameActive || !runnerPlaying) startRunnerGame({ moving: true });
      runnerRunHeld = true;
      setRunnerMoving(true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      runnerRunHeld = false;
      setRunnerMoving(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!introGameActive || !runnerPlaying) startRunnerGame();
      runnerDuckHeld = true;
      markRunnerAction();
    } else if ([' ', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if (event.repeat) return;
      const autoStop = !runnerRunHeld && !runnerMoving;
      if (!introGameActive || !runnerPlaying) startRunnerGame({ moving: true });
      else setRunnerMoving(true);
      jumpRunner({ autoStop });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (introGameActive && !runnerPlaying) startRunnerGame();
      else enterFromIntro();
    }
    if (event.key === 'Escape') enterFromIntro({ skip: true });
    return;
  }
  if (event.key === 'Escape') {
    closePanels();
    closeMedia();
    closeMenu();
  }
  if (!scanLightbox.hidden && event.key === 'ArrowLeft') { activeMediaIndex -= 1; showActiveMedia(); }
  if (!scanLightbox.hidden && event.key === 'ArrowRight') { activeMediaIndex += 1; showActiveMedia(); }
  if (scanLightbox.hidden && !['INPUT', 'TEXTAREA'].includes(event.target.tagName) && event.key.toLowerCase() === 'q') openPanel('quests');
  if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName) && event.key.toLowerCase() === 'm') sidebar.classList.contains('open') ? closeMenu() : openMenu();
});

document.addEventListener('keyup', (event) => {
  if (!roniaIntro || roniaIntro.hidden) return;
  if (event.key === 'ArrowRight') {
    runnerRunHeld = false;
    setRunnerMoving(false);
  }
  if (event.key === 'ArrowDown') {
    runnerDuckHeld = false;
    markRunnerAction();
    if (runnerRunHeld) setRunnerMoving(true);
  }
});

document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('is-background-tab', document.hidden);
  if (document.hidden) {
    introPausedAt = performance.now();
    cancelAnimationFrame(introFrameRequest);
    introFrameRequest = 0;
    return;
  }

  const now = performance.now();
  const pausedFor = introPausedAt ? Math.max(0, now - introPausedAt) : 0;
  if (pausedFor) {
    if (introStartedAt) introStartedAt += pausedFor;
    if (introExitStartedAt) introExitStartedAt += pausedFor;
    if (runnerJumpStartedAt) runnerJumpStartedAt += pausedFor;
    if (runnerLastActionAt) runnerLastActionAt += pausedFor;
    if (runnerNextIdleActionAt) runnerNextIdleActionAt += pausedFor;
    if (runnerIdleAction?.startedAt) runnerIdleAction.startedAt += pausedFor;
  }
  introPausedAt = 0;
  runnerLastFrameAt = now;
  setIntroWorldPosition();
  if (roniaIntro && !roniaIntro.hidden && !introFrameRequest) {
    introFrameRequest = requestAnimationFrame(animateIntro);
  }
});

window.addEventListener('resize', () => {
  if (roniaIntro && !roniaIntro.hidden) setIntroWorldPosition();
});

window.addEventListener('blur', () => {
  if (!roniaIntro || roniaIntro.hidden) return;
  runnerRunHeld = false;
  runnerDuckHeld = false;
  setRunnerMoving(false);
});

let brandClicks = 0;
document.querySelector('.brand-link').addEventListener('click', () => {
  brandClicks += 1;
  if (brandClicks === 5) {
    showToast('Achievement unlocked: curious visitor cat ♡');
    brandClicks = 0;
  }
});

applyPortfolioSide(activePortfolioSide, { persist: false });
updateGameUI();
if (roniaIntro) initRoniaIntro();
else renderRoute();
