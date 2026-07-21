import {
  escapeHTML,
  formatProgressLabel,
  isChapterReadable,
} from '../../vendor/palimpsest/index.js';

function fmtShort(iso) {
  if (!iso) return '';
  const p = String(iso).split('-');
  if (p.length !== 3) return iso;
  return `${p[2]}.${p[1]}`;
}

function dateBadgeType(ch) {
  if (ch.date_badge === 'sun' || ch.date_badge === 'stamp') return ch.date_badge;
  if (ch.id === 'ch02') return 'sun';
  return 'stamp';
}

export function dateBadgeHtml(ch, { muted = false } = {}) {
  const date = fmtShort(ch.publish_date);
  if (!date) return '';
  const mutedCls = muted ? ' is-muted' : '';
  if (dateBadgeType(ch) === 'sun') {
    return `<span class="date-sun${mutedCls}" title="${date}">${date}</span>`;
  }
  return `<span class="date-stamp${mutedCls}">${date}</span>`;
}

function eraBadge(era) {
  if (!era) return '';
  const cls = era.includes('1944') ? 'e1944' : era.includes('1940') ? 'e1940' : '';
  return `<span class="era ${cls}">${escapeHTML(era)}</span>`;
}

function chapterStatusHtml(ch, progress, strings) {
  const label = formatProgressLabel(progress?.[ch.id], strings);
  if (label === strings.progressDone) {
    return `<span class="status status-done">${dateBadgeHtml(ch, { muted: true })}</span>`;
  }
  if (label) return `<span class="status status-progress">${escapeHTML(label)}</span>`;
  return `<span class="status status-date">${dateBadgeHtml(ch)}</span>`;
}

/**
 * Full Piligrim dossier landing (grain, hero, file-rows) — replaces default TOC.
 */
export function piligrimDossierToc(ctx) {
  const strings = ctx.strings || {};
  const soon = strings.soonLabel || 'скоро';
  const continueCta = strings.continueCta || 'продолжить';

  const rows = ctx.chapters
    .map((ch, i) => {
      const pub = isChapterReadable(ch, ctx.chapterAccess || 'published-only');
      const num = String(ch.number ?? i + 1).padStart(2, '0');
      const delay = i * 0.06;
      if (pub) {
        const prog = formatProgressLabel(ctx.progress?.[ch.id], {
          progressDone: strings.progressDone || 'прочитано',
          progressPct: strings.progressPct || '~{pct}%',
        });
        const cta = prog && prog !== (strings.progressDone || 'прочитано') ? continueCta : '';
        return `
        <a class="file-row file-row-pub animate-in" href="#/chapter/${encodeURIComponent(ch.id)}" style="--delay:${delay}s">
          <div class="num">№ <span>${num}</span></div>
          <div class="meta">
            <p class="title">${escapeHTML(ch.title)}</p>
            ${eraBadge(ch.era)}
            ${cta ? `<span class="row-continue">${escapeHTML(cta)}</span>` : ''}
          </div>
          ${chapterStatusHtml(ch, ctx.progress, {
            progressDone: strings.progressDone || 'прочитано',
            progressPct: strings.progressPct || '~{pct}%',
          })}
        </a>`;
      }
      return `
        <div class="file-row locked animate-in" style="--delay:${delay}s">
          <span class="lock-mark" aria-hidden="true"></span>
          <div class="num">№ <span>${num}</span></div>
          <div class="meta">
            <p class="title">${escapeHTML(ch.title)}</p>
            ${eraBadge(ch.era)}
          </div>
          <div class="status status-soon">${escapeHTML(soon)}</div>
        </div>`;
    })
    .join('');

  const pubCh = ctx.chapters.find((c) =>
    isChapterReadable(c, ctx.chapterAccess || 'published-only'),
  );
  const pubProg = pubCh
    ? formatProgressLabel(ctx.progress?.[pubCh.id], {
        progressDone: strings.progressDone || 'прочитано',
        progressPct: strings.progressPct || '~{pct}%',
      })
    : null;
  const done = strings.progressDone || 'прочитано';
  const ctaText =
    pubProg && pubProg !== done
      ? `Продолжить · ${pubProg}`
      : `Читать главу ${String(pubCh?.number || 1).padStart(2, '0')}`;

  return `
      <div class="grain"></div>
      <header class="topbar">
        <a class="brand" href="#/">Пилигрим</a>
        <span class="author-mark">アイダ ミール</span>
      </header>
      <section class="hero">
        <div class="hero-stamp" aria-hidden="true">EYES ONLY</div>
        <h1>Пилигрим</h1>
        <p class="sub">роман · УСС · 1940–1944</p>
        <p class="lede">Есть приказы, которые нельзя выполнить. Есть фотографии, которые нельзя забыть. Есть люди, которые знают, что ты сделаешь, ещё до того, как ты решил. «Пилигрим» — роман о выборе, которого не должно было быть.</p>
        ${pubCh ? `<a class="hero-cta" href="#/chapter/${encodeURIComponent(pubCh.id)}">${escapeHTML(ctaText)}</a>` : ''}
        <p class="byline">Автор: アイダ ミール</p>
      </section>
      <div class="perforation"></div>
      <section class="dossier">
        <h2>Главы</h2>
        ${rows}
      </section>
      <footer class="site">© アイダ ミール</footer>`;
}

/** Unwrap engine `.ps-home` wrapper; wrap chapters with Piligrim topbar. */
export function piligrimChapterTransition(ctx) {
  let html = ctx.html;
  const home = html.match(/^<div class="ps-home">([\s\S]*)<\/div>$/);
  if (home) {
    ctx.root.innerHTML = home[1];
    return;
  }

  const locked = html.includes('ps-locked-page') || html.includes('locked-page');
  const topbar = locked
    ? `<header class="topbar"><a class="brand" href="#/">Пилигрим</a></header>`
    : `<header class="topbar topbar-reader"><a class="brand" href="#/">← Пилигрим</a></header>`;

  // Prefer host CSS class `.ghost` for soon nav labels
  html = html.replace(/ps-nav-ghost/g, 'ghost ps-nav-ghost');
  ctx.root.innerHTML = `${topbar}${html}`;
}

/** One-time migrate Piligrim theme keys → PalST preset names. */
export function migratePiligrimThemeSettings(storageKey = 'pilgrim-reader') {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const s = JSON.parse(raw);
    const map = { paper: 'dossier', white: 'paper' };
    if (s.theme && map[s.theme]) {
      s.theme = map[s.theme];
      localStorage.setItem(storageKey, JSON.stringify(s));
    }
  } catch {
    /* ignore */
  }
}
