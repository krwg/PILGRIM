import {
  createReader,
  dossierTheme,
  paperTheme,
  sepiaTheme,
  nightTheme,
  setPageMeta,
} from '../../vendor/palimpsest/index.js';
import {
  migratePiligrimThemeSettings,
  piligrimChapterTransition,
  piligrimDossierToc,
} from './landing.js';

migratePiligrimThemeSettings('pilgrim-reader');

const RU = {
  toolbarLabel: 'Настройки чтения',
  fontMinus: 'Уменьшить шрифт',
  fontPlus: 'Увеличить шрифт',
  cycleTheme: 'Сменить тему',
  moreSettings: 'Ещё',
  spacingLabel: 'Интервал',
  narrowColumn: 'Узкая колонка',
  hideChrome: 'Скрыть панель',
  continueMessage: 'Вы остановились на ~{pct}%',
  continueYes: 'Продолжить',
  continueNo: 'С начала',
  prevChapter: 'Предыдущая глава',
  nextChapter: 'Следующая глава',
  closeLightbox: 'Закрыть',
  expandFigure: 'Увеличить иллюстрацию',
  translate: 'Перевести',
  original: 'Оригинал',
  chaptersLabel: 'Главы',
  soonLabel: 'скоро',
  lockedEyebrow: 'Засекречено',
  lockedMessage: 'Глава появится позже.',
  backToChapters: '← К списку глав',
  homeLink: 'На главную →',
  progressDone: 'прочитано',
  progressPct: '~{pct}%',
  continueCta: 'продолжить',
};

await createReader({
  root: document.getElementById('app'),
  baseUrl: new URL('../../', import.meta.url).href,
  manifestUrl: new URL('../../chapters/manifest.json', import.meta.url).href,
  storageKeys: {
    settings: 'pilgrim-reader',
    progress: 'pilgrim-progress',
  },
  theme: [dossierTheme, paperTheme, sepiaTheme, nightTheme],
  chapterAccess: 'published-only',
  chapterNav: true,
  prefetchNext: true,
  chrome: true,
  lightbox: true,
  progressBar: true,
  navigation: { gestures: true, continuePrompt: true },
  serviceWorkerUrl: new URL('../../sw.js', import.meta.url).href,
  serviceWorkerAutoUpdate: true,
  render: {
    figureCredit: 'Изображение сгенерировано Google Gemini',
    translateLabels: {
      toTranslation: 'Перевести',
      toOriginal: 'Оригинал',
    },
  },
  strings: RU,
  pageMeta: (input) => {
    const brand = 'Пилигрим';
    if (input.kind === 'home') {
      setPageMeta({
        title: 'Пилигрим — роман',
        description:
          'Роман о шпионаже УСС. Ницца 1940, Бретань 1944. Читать по главам.',
        image: 'assets/img/og-image.svg',
        path: '/',
        themeColor: input.themeColor,
      });
      return;
    }
    if (input.kind === 'locked') {
      setPageMeta({
        title: `${input.title} — ${brand}`,
        description: 'Глава появится позже.',
        image: 'assets/img/og-image.svg',
        path: input.path || '/',
        themeColor: input.themeColor,
      });
      return;
    }
    setPageMeta({
      title: `${input.title} — ${brand}`,
      description: input.description
        ? `${input.description}. Роман «Пилигрим».`
        : 'Роман «Пилигрим».',
      image: 'assets/img/og-image.svg',
      path: input.path || '/',
      themeColor: input.themeColor,
    });
  },
  onRoute: ({ kind }) => {
    document.body.classList.toggle('landing', kind === 'home');
  },
  slots: {
    TableOfContents: piligrimDossierToc,
    ChapterTransition: piligrimChapterTransition,
  },
});
