const APP = (() => {

  const root = document.getElementById('app');
  let MANIFEST = null;
  let activeTooltip = null;
  let scrollSaveTimer = null;
  let chromeHideTimer = null;
  let chapterCleanup = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const SETTINGS_KEY = 'pilgrim-reader';
  const PROGRESS_KEY = 'pilgrim-progress';
  const THEME_ORDER = ['paper', 'sepia', 'white', 'night'];
  const THEME_ICON = { paper: '◐', sepia: '◑', white: '○', night: '●' };
  const FIGURE_AI_CREDIT = 'Изображение сгенерировано Google Gemini';
  const settings = loadSettings();

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return {
        size: typeof s.size === 'number' ? s.size : 1,
        theme: s.theme || 'paper',
        spacing: s.spacing || 'normal',
        narrow: !!s.narrow,
        chromeHidden: false
      };
    } catch {
      return { size: 1, theme: 'paper', spacing: 'normal', narrow: false, chromeHidden: false };
    }
  }

  function saveSettings() {
    const { size, theme, spacing, narrow } = settings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ size, theme, spacing, narrow }));
  }

  function setLandingMode(on) {
    document.body.classList.toggle('landing', on);
  }

  function removeReaderChrome() {
    document.getElementById('read-progress-track')?.remove();
    document.getElementById('reader-bar')?.remove();
    document.getElementById('reader-reveal')?.remove();
  }

  function mountReaderChrome() {
    removeReaderChrome();
    const track = document.createElement('div');
    track.className = 'read-progress-track';
    track.id = 'read-progress-track';
    track.setAttribute('aria-hidden', 'true');
    track.innerHTML = '<div class="read-progress" id="read-progress"></div>';
    document.body.appendChild(track);
    const bar = document.createElement('div');
    bar.innerHTML = readerToolbar();
    while (bar.firstChild) document.body.appendChild(bar.firstChild);
  }

  function loadAllProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function getChapterProgress(chId) {
    return loadAllProgress()[chId] || null;
  }

  function saveChapterProgress(chId, scrollY, pct) {
    const all = loadAllProgress();
    all[chId] = { scrollY, pct, ts: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  }

  function progressLabel(chId) {
    const p = getChapterProgress(chId);
    if (!p || p.pct < 0.03) return null;
    if (p.pct >= 0.97) return 'прочитано';
    return `~${Math.round(p.pct * 100)}%`;
  }

  function absUrl(path) {
    return new URL(path, location.href).href;
  }

  function setPageMeta({ title, description, image, path }) {
    document.title = title;
    const ensure = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };
    ensure('name', 'description', description);
    ensure('property', 'og:title', title);
    ensure('property', 'og:description', description);
    ensure('property', 'og:image', absUrl(image));
    ensure('property', 'og:url', absUrl(path || '/'));
    ensure('property', 'og:type', 'website');
    ensure('name', 'twitter:card', 'summary_large_image');
    const theme = { paper: '#e8e4dc', sepia: '#d9cfc0', white: '#f2f2f7', night: '#0d0d0f' };
    ensure('name', 'theme-color', theme[settings.theme] || theme.paper);
  }

  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function cleanTooltipText(s) {
    return String(s)
      .replace(/\[\[\d+\]\]/g, '')
      .replace(/\[(\d+)\]/g, '')
      .replace(/__([^_]+)__/g, '$1');
  }

  function renderTooltipBody(text) {
    return text
      .split(/\n\n+/)
      .filter(Boolean)
      .map(p => `<p>${escapeHTML(p)}</p>`)
      .join('');
  }

  function parseTooltipDef(def) {
    const cleaned = cleanTooltipText(def).trim();
    const nl = cleaned.indexOf('\n\n');
    if (nl > 0) {
      return {
        term: cleaned.slice(0, nl).trim(),
        body: cleaned.slice(nl + 2).trim(),
      };
    }
    const dash = cleaned.indexOf(' — ');
    if (dash > 0) {
      return {
        term: cleaned.slice(0, dash).trim(),
        body: cleaned.slice(dash + 3).trim(),
      };
    }
    return { term: '', body: cleaned };
  }

  function buildTooltipElement(def, mobile) {
    const { term, body } = parseTooltipDef(def);
    const long = body.length > 380;
    const tip = document.createElement('div');
    if (mobile && long) {
      tip.className = 'tooltip tooltip-sheet';
    } else if (long) {
      tip.className = 'tooltip tooltip-panel';
    } else {
      tip.className = 'tooltip tooltip-float';
    }
    const handle = mobile && long ? '<div class="sheet-handle" aria-hidden="true"></div>' : '';
    const termHtml = term ? `<span class="t-term">${escapeHTML(term)}</span>` : '';
    tip.innerHTML = `${handle}${termHtml}<div class="t-body">${renderTooltipBody(body)}</div>`;
    return { tip, mobile, long };
  }

  function isMobile() {
    return window.matchMedia('(max-width: 600px)').matches;
  }

  async function getManifest() {
    if (MANIFEST) return MANIFEST;
    const res = await fetch('chapters/manifest.json', { cache: 'no-store' });
    MANIFEST = await res.json();
    return MANIFEST;
  }

  function isPublished(ch) {
    return ch.status === 'published';
  }

  function fmtShort(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    if (p.length !== 3) return iso;
    return `${p[2]}.${p[1]}`;
  }

  function dateBadgeType(ch) {
    if (ch.date_badge === 'sun' || ch.date_badge === 'stamp') return ch.date_badge;
    if (ch.id === 'ch02') return 'sun';
    return 'stamp';
  }

  function dateBadgeHtml(ch, { muted = false } = {}) {
    const date = fmtShort(ch.publish_date);
    if (!date) return '';
    const mutedCls = muted ? ' is-muted' : '';
    if (dateBadgeType(ch) === 'sun') {
      return `<span class="date-sun${mutedCls}" title="${date}">${date}</span>`;
    }
    return `<span class="date-stamp${mutedCls}">${date}</span>`;
  }

  function parseMetaBlock(fmBlock) {
    const meta = {};
    let key = null;
    fmBlock.split('\n').forEach(line => {
      const m = line.match(/^([a-zA-Z_]+):\s*(\|)?\s*(.*)$/);
      if (m) {
        key = m[1];
        if (m[2] === '|') meta[key] = [];
        else {
          let v = m[3].trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
            v = v.slice(1, -1);
          meta[key] = v;
          key = null;
        }
      } else if (key && Array.isArray(meta[key])) {
        meta[key].push(line.replace(/^\s{2}/, ''));
      }
    });
    if (Array.isArray(meta.epigraph)) meta.epigraph = meta.epigraph.join(' ').trim();
    return meta;
  }

  function extractGlossary(bodyRaw) {
    const glossary = {};
    const chunks = bodyRaw.split(/\n(?=\[\[\d+\]\]:)/);
    const bodyParts = [];
    for (const chunk of chunks) {
      const m = chunk.match(/^\[\[(\d+)\]\]:\s*([\s\S]*)$/);
      if (m) glossary[m[1]] = m[2].trim();
      else bodyParts.push(chunk);
    }
    return { glossary, body: bodyParts.join('').trim() };
  }

  function parseChapter(raw, fallback = {}) {
    const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const fmPatterns = [
      /^::chapter::\n([\s\S]*?)\n::\/chapter::\n([\s\S]*)$/,
      /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
    ];

    for (const pattern of fmPatterns) {
      const fmMatch = normalized.match(pattern);
      if (fmMatch) {
        const meta = parseMetaBlock(fmMatch[1]);
        const { glossary, body } = extractGlossary(fmMatch[2]);
        return { meta, glossary, body };
      }
    }

    const { glossary, body } = extractGlossary(normalized);
    return {
      meta: {
        title: fallback.title || '',
        era: fallback.era || '',
        when: fallback.when || '',
        epigraph: fallback.epigraph || '',
        epigraph_source: fallback.epigraph_source || '',
      },
      glossary,
      body,
    };
  }

  function linkTerms(html, glossary) {
    html = html.replace(/__([\p{L}\p{N}][\p{L}\p{N}\-']*)__\[\[(\d+)\]\]/gu, (m, word, id) => {
      if (!glossary[id]) return m;
      return `<button type="button" class="term" data-term="${id}">${word}</button>`;
    });
    html = html.replace(/(«?[\p{L}\p{N}][\p{L}\p{N}\-']*»?)\[\[(\d+)\]\]/gu, (m, word, id) => {
      if (!glossary[id]) return word;
      return `<button type="button" class="term" data-term="${id}">${word}</button>`;
    });
    return html;
  }

  function renderInline(text, glossary) {
    let html = escapeHTML(text);
    html = linkTerms(html, glossary);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<em>$1</em>');
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    return html;
  }

  function renderExhibit(inner, glossary) {
    const parts = inner.trim().split(/\n\s*\n/);
    let epigraph = '';
    let meta = '';
    let hand = '';
    const bodyEn = [];
    const bodyRu = [];
    let handRu = [];
    let mode = 'en';

    function ingestHandRuBlock(text) {
      if (!text) return;
      if (text.includes('::hand-meta::')) {
        const [ruPart, enPart] = text.split(/::hand-meta::\s*/);
        for (const line of ruPart.trim().split(/\n+/).filter(Boolean)) handRu.push(line);
        mode = 'hand';
        hand = { meta: '', lines: [] };
        for (const line of enPart.trim().split(/\n+/).filter(Boolean)) hand.lines.push(line);
        return;
      }
      for (const line of text.trim().split(/\n+/).filter(Boolean)) handRu.push(line);
    }

    for (const p of parts) {
      const tt = p.trim();
      if (!tt) continue;
      if (tt.startsWith('::label::')) {
        bodyEn.push(`<span class="ex-label">${escapeHTML(tt.replace('::label::', '').trim())}</span>`);
      } else if (tt.startsWith('::epigraph::')) {
        epigraph = tt.replace('::epigraph::', '').trim();
      } else if (tt.startsWith('::meta::')) {
        meta = tt.replace('::meta::', '').trim();
      } else if (tt.startsWith('::translate::')) {
        mode = 'ru';
      } else if (tt.startsWith('::hand-ru::')) {
        mode = 'hand-ru';
        ingestHandRuBlock(tt.replace(/^::hand-ru::\s*/, ''));
      } else if (tt.startsWith('::hand-meta::')) {
        mode = 'hand';
        const rest = tt.replace(/^::hand-meta::\s*/, '');
        hand = { meta: '', lines: [] };
        if (rest) {
          for (const line of rest.trim().split(/\n+/).filter(Boolean)) hand.lines.push(line);
        }
      } else if (tt.startsWith('::hand::')) {
        mode = 'hand';
        hand = { meta: '', lines: [tt.replace('::hand::', '').trim()] };
      } else if (tt.startsWith('::margin::')) {
        mode = 'hand';
        hand = { meta: tt.replace('::margin::', '').trim(), lines: [] };
      } else if (mode === 'ru') {
        bodyRu.push(`<p>${renderInline(tt, glossary)}</p>`);
      } else if (mode === 'hand-ru') {
        handRu.push(tt);
      } else if (mode === 'hand' && hand && typeof hand === 'object') {
        hand.lines.push(tt);
      } else {
        bodyEn.push(`<p>${renderInline(tt, glossary)}</p>`);
      }
    }

    let epigraphHtml = '';
    if (epigraph) {
      const sep = epigraph.indexOf('|||');
      if (sep > 0) {
        const quote = epigraph.slice(0, sep);
        const cite = epigraph.slice(sep + 3);
        epigraphHtml = `<blockquote class="exhibit-epigraph"><p>${renderInline(quote, glossary)}</p><cite>Auszug: ${renderInline(cite, glossary)}</cite></blockquote>`;
      } else {
        epigraphHtml = `<blockquote class="exhibit-epigraph"><p>${renderInline(epigraph, glossary)}</p></blockquote>`;
      }
    }
    const metaHtml = `<div class="exhibit-meta${meta ? '' : ' exhibit-meta--stamp-only'}"><span class="ex-meta-stamp">EYES ONLY</span>${meta ? `<p>${escapeHTML(meta)}</p>` : ''}</div>`;

    let handEnHtml = '';
    if (hand && typeof hand === 'object' && hand.lines.length) {
      const innerHand = hand.lines.map(l => `<p>${renderInline(l, glossary)}</p>`).join('');
      handEnHtml = `<div class="exhibit-hand exhibit-lang exhibit-lang-en">${innerHand}</div>`;
    }

    let handRuHtml = '';
    if (handRu.length) {
      const innerHand = handRu.map(l => `<p>${renderInline(l, glossary)}</p>`).join('');
      handRuHtml = `<div class="exhibit-hand exhibit-lang exhibit-lang-ru" hidden>${innerHand}</div>`;
    }

    const hasRu = bodyRu.length > 0;
    const enBlock = `<div class="exhibit-body exhibit-lang exhibit-lang-en">${bodyEn.join('')}</div>`;
    const ruBlock = hasRu ? `<div class="exhibit-body exhibit-lang exhibit-lang-ru" hidden>${bodyRu.join('')}</div>` : '';
    const translateBtn = hasRu
      ? `<div class="exhibit-footer"><button type="button" class="exhibit-translate-btn" data-lang="en">Перевести</button></div>`
      : '';

    return `<div class="exhibit-wrap" data-exhibit-lang="en">${epigraphHtml}<div class="exhibit-sheet">${metaHtml}${enBlock}${ruBlock}${handEnHtml}${handRuHtml}${translateBtn}</div></div>`;
  }

  function bindExhibitTranslate(container) {
    container.querySelectorAll('.exhibit-translate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.exhibit-wrap');
        if (!wrap) return;
        const showRu = wrap.dataset.exhibitLang === 'en';
        wrap.dataset.exhibitLang = showRu ? 'ru' : 'en';
        wrap.querySelectorAll('.exhibit-lang-en').forEach(el => { el.hidden = showRu; });
        wrap.querySelectorAll('.exhibit-lang-ru').forEach(el => { el.hidden = !showRu; });
        btn.textContent = showRu ? 'Оригинал' : 'Перевести';
      });
    });
  }

  function parseFigureInner(inner) {
    const normalized = inner.replace(/\r\n/g, '\n').trim();
    if (!normalized) return null;
    const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 1) {
      const m = lines[0].match(/^(\S+)\s+(.+)$/);
      if (m && m[1].startsWith('assets/')) {
        return { src: m[1], caption: m[2], tag: '' };
      }
      return null;
    }
    let tag = '';
    let caption = '';
    if (lines.length >= 3) {
      tag = lines[lines.length - 1];
      caption = lines.slice(1, -1).join(' ');
    } else {
      caption = lines.slice(1).join(' ');
    }
    return { src: lines[0], caption, tag };
  }

  function renderFigure(inner) {
    const parsed = parseFigureInner(inner);
    if (!parsed) return '';
    const src = safeFigureSrc(parsed.src);
    if (!src) return '';
    const { caption, tag } = parsed;
    const alt = caption || tag || '';
    const tagHtml = tag ? `<span class="figure-tag">${escapeHTML(tag)}</span>` : '';
    const capHtml = caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : '';
    const creditHtml = `<p class="figure-credit">${escapeHTML(FIGURE_AI_CREDIT)}</p>`;
    return `<figure class="chapter-figure">${tagHtml}<button type="button" class="chapter-figure-btn" aria-label="Увеличить иллюстрацию"><img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async"></button>${capHtml}${creditHtml}</figure>`;
  }

  function safeFigureSrc(src) {
    const s = src.trim();
    if (!/^assets\/img\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|svg)$/i.test(s)) return null;
    return s;
  }

  function bindFigureLightbox(container) {
    let lb = document.getElementById('figure-lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'figure-lightbox';
      lb.className = 'figure-lightbox';
      lb.hidden = true;
      lb.innerHTML = '<button type="button" class="figure-lightbox-close" aria-label="Закрыть">×</button><img alt="">';
      document.body.appendChild(lb);
      lb.addEventListener('click', e => {
        if (e.target === lb || e.target.classList.contains('figure-lightbox-close')) {
          lb.hidden = true;
          document.body.classList.remove('lightbox-open');
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lb && !lb.hidden) {
          lb.hidden = true;
          document.body.classList.remove('lightbox-open');
        }
      });
    }
    container.querySelectorAll('.chapter-figure-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        const full = lb.querySelector('img');
        full.src = img.currentSrc || img.src;
        full.alt = img.alt;
        lb.hidden = false;
        document.body.classList.add('lightbox-open');
      });
    });
  }

  function renderBody(body, glossary) {
    body = body.replace(/\r\n/g, '\n');
    const exhibits = [];
    const figures = [];
    let withPlaceholders = body.replace(/:::document\n([\s\S]*?)\n:::/g, (_, inner) => {
      exhibits.push(inner);
      return `\n\n@@EXHIBIT${exhibits.length - 1}@@\n\n`;
    });
    withPlaceholders = withPlaceholders.replace(/::figure::\s*([\s\S]*?)\s*::\/figure::/g, (_, inner) => {
      figures.push(inner);
      return `\n\n@@FIGURE${figures.length - 1}@@\n\n`;
    });

    const blocks = withPlaceholders.split(/\n\s*\n/);
    let html = '';
    for (const block of blocks) {
      const t = block.trim();
      if (!t) continue;
      const exMatch = t.match(/^@@EXHIBIT(\d+)@@$/);
      if (exMatch) {
        html += renderExhibit(exhibits[Number(exMatch[1])], glossary);
        continue;
      }
      const figMatch = t.match(/^@@FIGURE(\d+)@@$/);
      if (figMatch) {
        html += renderFigure(figures[Number(figMatch[1])]);
        continue;
      }
      if (/::figure::[\s\S]*?::\/figure::/i.test(t)) {
        const parts = t.split(/(::figure::\s*[\s\S]*?\s*::\/figure::)/gi);
        for (const part of parts) {
          const inline = part.match(/^::figure::\s*([\s\S]*?)\s*::\/figure::$/i);
          if (inline) html += renderFigure(inline[1]);
          else if (part.trim()) html += `<p>${renderInline(part.trim(), glossary)}</p>`;
        }
        continue;
      }
      if (t === '***' || t === '---') {
        html += '<hr>';
        continue;
      }
      if (/^__(.+)__$/.test(t)) {
        html += `<p class="scene-label">${renderInline(t.slice(2, -2), glossary)}</p>`;
        continue;
      }
      if (t.startsWith('— ')) {
        html += `<p class="dialogue">${renderInline(t, glossary)}</p>`;
        continue;
      }
      html += `<p>${renderInline(t, glossary)}</p>`;
    }
    return html;
  }

  function closeTooltip() {
    if (activeTooltip) {
      activeTooltip.classList.remove('tooltip-visible');
      const tip = activeTooltip;
      setTimeout(() => tip.remove(), 200);
      activeTooltip = null;
    }
    document.body.classList.remove('tooltip-open', 'tooltip-open-light', 'tooltip-panel-open');
  }

  function bindSheetSwipe(tip) {
    let startY = 0;
    const handle = tip.querySelector('.sheet-handle');
    const onStart = e => { startY = (e.touches ? e.touches[0] : e).clientY; };
    const onEnd = e => {
      const y = (e.changedTouches ? e.changedTouches[0] : e).clientY;
      if (y - startY > 60) closeTooltip();
    };
    if (handle) {
      handle.addEventListener('touchstart', onStart, { passive: true });
      handle.addEventListener('touchend', onEnd);
    }
    tip.addEventListener('touchstart', onStart, { passive: true });
    tip.addEventListener('touchend', onEnd);
  }

  function bindTermHandlers(container, glossary) {
    container.querySelectorAll('.term').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        const id = btn.dataset.term;
        const def = glossary[id];
        if (!def) return;
        const already = activeTooltip && activeTooltip.dataset.owner === id;
        closeTooltip();
        if (already) return;

        const mobile = isMobile();
        const { tip, long } = buildTooltipElement(def, mobile);
        tip.dataset.owner = id;
        document.body.appendChild(tip);
        const panel = long && !mobile;
        const sheet = long && mobile;
        document.body.classList.add(sheet ? 'tooltip-open' : panel ? 'tooltip-panel-open' : 'tooltip-open-light');

        if (sheet) {
          bindSheetSwipe(tip);
          requestAnimationFrame(() => tip.classList.add('tooltip-visible'));
        } else if (panel) {
          requestAnimationFrame(() => tip.classList.add('tooltip-visible'));
        } else {
          const r = btn.getBoundingClientRect();
          const pad = 12;
          const gap = 10;
          const tw = tip.offsetWidth;
          const th = tip.offsetHeight;
          let left = r.right + gap;
          if (left + tw > window.innerWidth - pad) {
            left = r.left - tw - gap;
          }
          left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));
          let top = r.top + r.height / 2 - th / 2;
          top = Math.max(pad, Math.min(top, window.innerHeight - th - pad));
          tip.style.left = left + window.scrollX + 'px';
          tip.style.top = top + window.scrollY + 'px';
          requestAnimationFrame(() => tip.classList.add('tooltip-visible'));
        }
        activeTooltip = tip;
      });
    });
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.tooltip') && !e.target.closest('.term')) closeTooltip();
    if (readerPopoverOpen && !e.target.closest('#reader-bar')) closeReaderPopover();
  });
  window.addEventListener('resize', closeTooltip);

  function spacingValue() {
    return { compact: 1.55, normal: 1.75, spacious: 2 }[settings.spacing] || 1.75;
  }

  function applyReaderSettings() {
    const body = document.body;
    body.className = body.className
      .replace(/theme-\w+/g, '')
      .replace(/in-reader/g, '')
      .replace(/reader-narrow/g, '')
      .replace(/chrome-hidden/g, '')
      .trim();
    body.classList.add(`theme-${settings.theme}`);
    if (document.querySelector('.reader')) body.classList.add('in-reader');
    if (settings.narrow) body.classList.add('reader-narrow');
    if (settings.chromeHidden) body.classList.add('chrome-hidden');

    const prose = document.querySelector('.reader .prose');
    if (prose) {
      prose.style.fontSize = (1.05 * settings.size).toFixed(2) + 'rem';
      prose.style.lineHeight = String(spacingValue());
    }
    document.querySelectorAll('[data-spacing]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.spacing === settings.spacing);
    });
    const themeBtn = document.getElementById('cycle-theme');
    if (themeBtn) themeBtn.textContent = THEME_ICON[settings.theme] || '◐';
    const narrowBtn = document.getElementById('toggle-narrow');
    if (narrowBtn) narrowBtn.classList.toggle('active', settings.narrow);
    const chromeBtn = document.getElementById('toggle-chrome');
    if (chromeBtn) chromeBtn.classList.toggle('active', settings.chromeHidden);
    const sizeLabel = document.querySelector('.reader-size-label');
    if (sizeLabel) sizeLabel.textContent = Math.round(settings.size * 100) + '%';
  }

  function readerToolbar() {
    return `
      <div class="reader-bar" id="reader-bar" role="toolbar" aria-label="Настройки чтения">
        <div class="reader-bar-compact">
          <button type="button" id="font-minus" aria-label="Уменьшить шрифт">A−</button>
          <span class="reader-size-label">${Math.round(settings.size * 100)}%</span>
          <button type="button" id="font-plus" aria-label="Увеличить шрифт">A+</button>
          <button type="button" id="cycle-theme" aria-label="Сменить тему">${THEME_ICON[settings.theme]}</button>
          <button type="button" id="reader-more" aria-label="Ещё настройки" aria-expanded="false">⋯</button>
        </div>
        <div class="reader-popover" id="reader-popover" hidden>
          <p class="reader-popover-label">Интервал строк</p>
          <div class="reader-popover-row">
            <button type="button" data-spacing="compact" class="${settings.spacing === 'compact' ? 'active' : ''}">S</button>
            <button type="button" data-spacing="normal" class="${settings.spacing === 'normal' ? 'active' : ''}">M</button>
            <button type="button" data-spacing="spacious" class="${settings.spacing === 'spacious' ? 'active' : ''}">L</button>
          </div>
          <button type="button" id="toggle-narrow" class="reader-popover-item${settings.narrow ? ' active' : ''}">Узкая колонка</button>
          <button type="button" id="toggle-chrome" class="reader-popover-item${settings.chromeHidden ? ' active' : ''}">Скрыть панель</button>
        </div>
      </div>
      <div class="reader-reveal-zone" id="reader-reveal" aria-hidden="true"></div>`;
  }

  let readerPopoverOpen = false;

  function closeReaderPopover() {
    readerPopoverOpen = false;
    const pop = document.getElementById('reader-popover');
    const more = document.getElementById('reader-more');
    if (pop) pop.hidden = true;
    if (more) more.setAttribute('aria-expanded', 'false');
  }

  function bindReaderControls() {
    const minus = document.getElementById('font-minus');
    const plus = document.getElementById('font-plus');
    if (minus) minus.onclick = () => { settings.size = Math.max(0.75, settings.size - 0.08); saveSettings(); applyReaderSettings(); };
    if (plus) plus.onclick = () => { settings.size = Math.min(1.55, settings.size + 0.08); saveSettings(); applyReaderSettings(); };
    const cycle = document.getElementById('cycle-theme');
    if (cycle) cycle.onclick = () => {
      const i = THEME_ORDER.indexOf(settings.theme);
      settings.theme = THEME_ORDER[(i + 1) % THEME_ORDER.length];
      saveSettings();
      applyReaderSettings();
    };
    const more = document.getElementById('reader-more');
    const popover = document.getElementById('reader-popover');
    if (more && popover) {
      more.onclick = e => {
        e.stopPropagation();
        readerPopoverOpen = !readerPopoverOpen;
        popover.hidden = !readerPopoverOpen;
        more.setAttribute('aria-expanded', readerPopoverOpen);
      };
    }
    document.querySelectorAll('[data-spacing]').forEach(btn => {
      btn.onclick = () => {
        settings.spacing = btn.dataset.spacing;
        saveSettings();
        applyReaderSettings();
        closeReaderPopover();
      };
    });
    const narrow = document.getElementById('toggle-narrow');
    if (narrow) narrow.onclick = () => { settings.narrow = !settings.narrow; saveSettings(); applyReaderSettings(); };
    const chrome = document.getElementById('toggle-chrome');
    if (chrome) chrome.onclick = () => {
      settings.chromeHidden = !settings.chromeHidden;
      applyReaderSettings();
      closeReaderPopover();
    };
    const reveal = document.getElementById('reader-reveal');
    if (reveal) {
      reveal.onclick = () => {
        document.body.classList.remove('chrome-hidden');
        clearTimeout(chromeHideTimer);
        chromeHideTimer = setTimeout(() => {
          if (settings.chromeHidden) document.body.classList.add('chrome-hidden');
        }, 4000);
      };
    }
  }

  function updateReadProgressBar() {
    const bar = document.getElementById('read-progress');
    if (!bar) return 0;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    bar.style.width = (pct * 100).toFixed(2) + '%';
    return pct;
  }

  function bindChapterScroll(chId) {
    const onScroll = () => {
      const pct = updateReadProgressBar();
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        saveChapterProgress(chId, window.scrollY, pct);
      }, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollSaveTimer);
    };
  }

  function showContinuePrompt(chId, saved) {
    if (!saved || saved.pct < 0.03 || saved.scrollY < 80) return;
    const pct = Math.round(saved.pct * 100);
    const overlay = document.createElement('div');
    overlay.className = 'continue-prompt';
    overlay.innerHTML = `
      <div class="continue-card">
        <p>Вы остановились на ~${pct}%</p>
        <div class="continue-actions">
          <button type="button" class="continue-yes">Продолжить</button>
          <button type="button" class="continue-no">С начала</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
    overlay.querySelector('.continue-yes').onclick = () => {
      window.scrollTo(0, saved.scrollY);
      overlay.remove();
      updateReadProgressBar();
    };
    overlay.querySelector('.continue-no').onclick = () => {
      saveChapterProgress(chId, 0, 0);
      overlay.remove();
    };
  }

  function bindGestures(prevId, nextId) {
    const zones = [];
    if (prevId) {
      const z = document.createElement('button');
      z.className = 'nav-zone nav-zone-prev';
      z.setAttribute('aria-label', 'Предыдущая глава');
      z.onclick = () => { location.hash = `#/chapter/${prevId}`; };
      document.body.appendChild(z);
      zones.push(z);
    }
    if (nextId) {
      const z = document.createElement('button');
      z.className = 'nav-zone nav-zone-next';
      z.setAttribute('aria-label', 'Следующая глава');
      z.onclick = () => { location.hash = `#/chapter/${nextId}`; };
      document.body.appendChild(z);
      zones.push(z);
    }
    const onTouchStart = e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0 && prevId) location.hash = `#/chapter/${prevId}`;
      if (dx < 0 && nextId) location.hash = `#/chapter/${nextId}`;
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      zones.forEach(z => z.remove());
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }

  function setPrefetch(href) {
    document.querySelectorAll('link[data-prefetch]').forEach(l => l.remove());
    if (!href) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.dataset.prefetch = '1';
    document.head.appendChild(link);
  }

  function eraBadge(era) {
    if (!era) return '';
    const cls = era.includes('1944') ? 'e1944' : (era.includes('1940') ? 'e1940' : '');
    return `<span class="era ${cls}">${escapeHTML(era)}</span>`;
  }

  function chapterStatusHtml(ch) {
    const prog = progressLabel(ch.id);
    if (prog === 'прочитано') return `<span class="status status-done">${dateBadgeHtml(ch, { muted: true })}</span>`;
    if (prog) return `<span class="status status-progress">${prog}</span>`;
    return `<span class="status status-date">${dateBadgeHtml(ch)}</span>`;
  }

  async function viewLanding() {
    const data = await getManifest();
    setPageMeta({
      title: 'Пилигрим — роман',
      description: 'Роман о шпионаже УСС. Ницца 1940, Бретань 1944. Читать по главам.',
      image: 'assets/img/og-image.svg',
      path: '/'
    });
    setPrefetch(null);

    const rows = data.chapters.map((ch, i) => {
      const pub = isPublished(ch);
      const num = String(ch.number).padStart(2, '0');
      const delay = i * 0.06;
      if (pub) {
        const prog = progressLabel(ch.id);
        const cta = prog && prog !== 'прочитано' ? 'продолжить' : '';
        return `
        <a class="file-row file-row-pub animate-in" href="#/chapter/${ch.id}" style="--delay:${delay}s">
          <div class="num">№ <span>${num}</span></div>
          <div class="meta">
            <p class="title">${escapeHTML(ch.title)}</p>
            ${eraBadge(ch.era)}
            ${cta ? `<span class="row-continue">${cta}</span>` : ''}
          </div>
          ${chapterStatusHtml(ch)}
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
          <div class="status status-soon">скоро</div>
        </div>`;
    }).join('');

    const pubCh = data.chapters.find(c => isPublished(c));
    const pubProg = pubCh ? progressLabel(pubCh.id) : null;
    const ctaText = pubProg && pubProg !== 'прочитано'
      ? `Продолжить · ${pubProg}`
      : `Читать главу ${String(pubCh?.number || 1).padStart(2, '0')}`;

    root.innerHTML = `
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
        ${pubCh ? `<a class="hero-cta" href="#/chapter/${pubCh.id}">${ctaText}</a>` : ''}
        <p class="byline">Автор: アイダ ミール</p>
      </section>
      <div class="perforation"></div>
      <section class="dossier">
        <h2>Главы</h2>
        ${rows}
      </section>
      <footer class="site">© アイダ ミール</footer>`;

    document.body.className = `theme-${settings.theme}`;
    setLandingMode(true);
    removeReaderChrome();
  }

  function showChapterError(title, message, err) {
    console.error(err);
    removeReaderChrome();
    setLandingMode(false);
    root.innerHTML = `
      <header class="topbar"><a class="brand" href="#/">Пилигрим</a></header>
      <div class="reader locked-page">
        <p class="eyebrow">Ошибка</p>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(message)}</p>
        <p><a href="#/">← К списку глав</a></p>
      </div>`;
    document.body.className = `theme-${settings.theme}`;
  }

  async function viewChapter(id) {
    setLandingMode(false);
    if (chapterCleanup) { chapterCleanup(); chapterCleanup = null; }
    closeTooltip();
    document.querySelectorAll('.nav-zone, .continue-prompt').forEach(el => el.remove());

    let data;
    let ch;
    let idx = -1;
    try {
      data = await getManifest();
      idx = data.chapters.findIndex(c => c.id === id);
      ch = data.chapters[idx];
    } catch (err) {
      showChapterError('Пилигрим', 'Не удалось загрузить список глав.', err);
      return;
    }

    if (!ch) {
      setLandingMode(false);
      removeReaderChrome();
      root.innerHTML = `<div class="reader"><p><a href="#/">← На главную</a></p></div>`;
      return;
    }

    if (!isPublished(ch)) {
      setLandingMode(false);
      removeReaderChrome();
      setPageMeta({
        title: `${ch.title} — Пилигрим`,
        description: 'Глава появится позже.',
        image: 'assets/img/og-image.svg',
        path: `/chapter/${id}`
      });
      root.innerHTML = `
        <header class="topbar"><a class="brand" href="#/">Пилигрим</a></header>
        <div class="reader locked-page">
          <p class="eyebrow">Засекречено</p>
          <h1>${escapeHTML(ch.title)}</h1>
          <p>Глава появится позже.</p>
          <p><a href="#/">← К списку глав</a></p>
        </div>`;
      document.body.className = `theme-${settings.theme}`;
      return;
    }

    root.innerHTML = `
      <header class="topbar topbar-reader">
        <a class="brand" href="#/">← Пилигрим</a>
        <span class="chapter-badge">№ ${String(ch.number).padStart(2, '0')}</span>
      </header>
      <article class="reader reader-loading">
        <p class="when">Загрузка главы…</p>
      </article>`;

    let raw;
    try {
      const res = await fetch(ch.file, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = await res.text();
    } catch (err) {
      showChapterError(ch.title, 'Не удалось загрузить текст главы. Обновите страницу.', err);
      return;
    }

    let meta;
    let glossary;
    let body;
    let html;
    try {
      ({ meta, glossary, body } = parseChapter(raw, ch));
      html = renderBody(body, glossary);
    } catch (err) {
      showChapterError(ch.title, 'Не удалось разобрать главу.', err);
      return;
    }

    const prev = data.chapters[idx - 1];
    const next = data.chapters[idx + 1];
    const prevPub = prev && isPublished(prev);
    const nextPub = next && isPublished(next);

    setPageMeta({
      title: `${meta.title || ch.title} — Пилигрим`,
      description: `Глава ${ch.number}. ${meta.era || ch.era || ''}. Роман «Пилигрим».`,
      image: 'assets/img/og-image.svg',
      path: `/chapter/${id}`
    });
    if (nextPub) setPrefetch(next.file);
    else setPrefetch(null);

    root.innerHTML = `
      <header class="topbar topbar-reader">
        <a class="brand" href="#/">← Пилигрим</a>
        <span class="chapter-badge">№ ${String(ch.number).padStart(2, '0')}</span>
      </header>
      <article class="reader" data-chapter="${ch.id}">
        <header class="chapter-head">
          ${ch.publish_date ? `<p class="chapter-publish-mark">${dateBadgeHtml(ch)}</p>` : ''}
          <p class="chapter-era">${escapeHTML(meta.era || ch.era || '')}</p>
          <h1>${escapeHTML(meta.title || ch.title)}</h1>
          <p class="when">${escapeHTML(meta.when || meta.date || '')}</p>
        </header>
        ${meta.epigraph ? `
        <blockquote class="epigraph">
          <p>«${renderInline(meta.epigraph, glossary)}»</p>
          ${meta.epigraph_source ? `<cite>${renderInline(meta.epigraph_source, glossary)}</cite>` : ''}
        </blockquote>` : ''}
        <div class="prose">${html}</div>
        <nav class="chapter-nav">
          <div>${prev ? (prevPub ? `<a href="#/chapter/${prev.id}">← ${escapeHTML(prev.title)}</a>` : `<span class="ghost">← скоро</span>`) : ''}</div>
          <div>${next ? (nextPub ? `<a href="#/chapter/${next.id}">${escapeHTML(next.title)} →</a>` : `<span class="ghost">скоро →</span>`) : `<a href="#/">На главную →</a>`}</div>
        </nav>
      </article>`;

    mountReaderChrome();
    bindTermHandlers(root.querySelector('.reader'), glossary);
    bindExhibitTranslate(root.querySelector('.reader'));
    bindFigureLightbox(root.querySelector('.reader'));
    bindReaderControls();
    applyReaderSettings();

    const saved = getChapterProgress(ch.id);
    window.scrollTo(0, 0);
    updateReadProgressBar();
    showContinuePrompt(ch.id, saved);

    const cleanScroll = bindChapterScroll(ch.id);
    const cleanGestures = bindGestures(prevPub ? prev.id : null, nextPub ? next.id : null);
    chapterCleanup = () => {
      cleanScroll();
      cleanGestures();
    };
  }

  async function route() {
    closeTooltip();
    closeReaderPopover();
    if (chapterCleanup) { chapterCleanup(); chapterCleanup = null; }
    document.querySelectorAll('.nav-zone, .continue-prompt').forEach(el => el.remove());
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/chapter\/([\w-]+)/);
    if (m) await viewChapter(m[1]);
    else {
      removeReaderChrome();
      await viewLanding();
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      }).catch(() => {});
      navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
    });
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);

  return { route };
})();
