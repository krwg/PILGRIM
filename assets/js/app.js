/* =========================================================
   ДЕЛО В НИЦЦЕ: ПИЛИГРИМ — app.js
   Без сборки, без зависимостей. Чистый JS + fetch.

   Чтобы добавить новую главу:
     1. Скопировать chapters/_TEMPLATE.md → chapters/chNN.md, заполнить.
     2. Добавить одну запись в chapters/manifest.json.
     3. Залить на GitHub — код трогать не нужно.
   ========================================================= */

const APP = (() => {

  const root = document.getElementById('app');
  let MANIFEST = null;

  // ---------- утилиты ----------

  const todayISO = () => new Date().toISOString().slice(0,10);

  const fmtDate = (iso) => {
    if(!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' });
  };

  function escapeHTML(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  async function getManifest(){
    if(MANIFEST) return MANIFEST;
    const res = await fetch('chapters/manifest.json', { cache:'no-store' });
    MANIFEST = await res.json();
    return MANIFEST;
  }

  function isPublished(ch){
    if(ch.status === 'soon') return false;
    if(ch.status === 'published') return true;
    // запасной вариант: если status не указан — судим по дате
    return !ch.publish_date || ch.publish_date <= todayISO();
  }

  // ---------- парсер .md главы ----------
  // Формат описан в chapters/_TEMPLATE.md

  function parseChapter(raw){
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if(!fmMatch) throw new Error('Нет front-matter (---) в начале файла главы');
    const [, fmBlock, bodyRaw] = fmMatch;

    const meta = {};
    let key = null;
    fmBlock.split('\n').forEach(line=>{
      const m = line.match(/^([a-zA-Z_]+):\s*(\|)?\s*(.*)$/);
      if(m){
        key = m[1];
        if(m[2] === '|'){ meta[key] = []; }
        else { meta[key] = m[3].trim(); key = null; }
      } else if(key && Array.isArray(meta[key])){
        meta[key].push(line.replace(/^\s{2}/,''));
      }
    });
    if(Array.isArray(meta.epigraph)) meta.epigraph = meta.epigraph.join(' ').trim();

    // вытащить определения сносок [[N]]: текст
    const glossary = {};
    const bodyNoDefs = bodyRaw.replace(/^\[\[(\w+)\]\]:\s*(.+)$/gm, (m, id, def)=>{
      glossary[id] = def.trim();
      return '';
    });

    return { meta, glossary, body: bodyNoDefs.trim() };
  }

  // ---------- рендер тела главы в HTML ----------

  function renderInline(text){
    let html = escapeHTML(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<em>$1</em>');
    html = html.replace(/\[\[(\w+)\]\]/g, (m, id)=>{
      return `<button type="button" class="term" data-term="${id}">•</button>`;
    });
    return html;
  }

  function renderExhibit(inner){
    const parts = inner.trim().split(/\n\s*\n/);
    const body = parts.map(p=>{
      const tt = p.trim();
      if(tt.startsWith('::label::')){
        return `<span class="ex-label">${escapeHTML(tt.replace('::label::','').trim())}</span>`;
      }
      if(tt.startsWith('::margin::')){
        return `<div class="marginalia">${renderInline(tt.replace('::margin::','').trim())}</div>`;
      }
      return `<p>${renderInline(tt)}</p>`;
    }).join('');
    return `<div class="exhibit">${body}</div>`;
  }

  function renderBody(body){
    // сначала вытаскиваем блоки документов — независимо от пустых строк вокруг ::: —
    // и подставляем плейсхолдеры, чтобы дальнейшая разбивка по абзацам их не ломала
    const exhibits = [];
    const withPlaceholders = body.replace(/:::document\n([\s\S]*?)\n:::/g, (m, inner)=>{
      exhibits.push(inner);
      return `\n\n@@EXHIBIT${exhibits.length-1}@@\n\n`;
    });

    const blocks = withPlaceholders.split(/\n\s*\n/);
    let html = '';
    for(const block of blocks){
      const t = block.trim();
      if(!t) continue;
      const exMatch = t.match(/^@@EXHIBIT(\d+)@@$/);
      if(exMatch){ html += renderExhibit(exhibits[Number(exMatch[1])]); continue; }
      if(t === '***' || t === '---'){ html += '<hr>'; continue; }
      html += `<p>${renderInline(t)}</p>`;
    }
    return html;
  }

  // ---------- подсказки по терминам (клик/тап) ----------

  let activeTooltip = null;

  function closeTooltip(){
    if(activeTooltip){ activeTooltip.remove(); activeTooltip = null; }
  }

  function bindTermHandlers(container, glossary){
    container.querySelectorAll('.term').forEach(btn=>{
      btn.textContent = '';
      btn.setAttribute('aria-label', 'Пояснение термина');
      btn.innerHTML = '•';
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const id = btn.dataset.term;
        const def = glossary[id];
        const already = activeTooltip && activeTooltip.dataset.owner === id;
        closeTooltip();
        if(already) return;
        const tip = document.createElement('div');
        tip.className = 'tooltip';
        tip.dataset.owner = id;
        if(def){
          const [term, ...rest] = def.split(' — ');
          tip.innerHTML = `<span class="t-term">${escapeHTML(term)}</span>${escapeHTML(rest.join(' — '))}`;
        } else {
          tip.innerHTML = `<span class="t-term">сноска ${escapeHTML(id)}</span>пояснение пока не добавлено в главу.`;
        }
        document.body.appendChild(tip);
        const r = btn.getBoundingClientRect();
        const top = window.scrollY + r.bottom + 8;
        let left = window.scrollX + r.left;
        const maxLeft = window.scrollX + document.documentElement.clientWidth - tip.offsetWidth - 12;
        left = Math.max(12, Math.min(left, maxLeft));
        tip.style.top = top + 'px';
        tip.style.left = left + 'px';
        activeTooltip = tip;
      });
    });
  }

  document.addEventListener('click', closeTooltip);
  window.addEventListener('resize', closeTooltip);

  // ---------- настройки чтения (без localStorage — только в памяти сессии) ----------

  const settings = { size: 1, dark: false };

  function applyReaderSettings(){
    document.body.classList.toggle('reading-dark', settings.dark);
    const reader = document.querySelector('.reader .prose');
    if(reader) reader.style.fontSize = (1.14 * settings.size).toFixed(2) + 'rem';
  }

  // ---------- виды (роутинг по хэшу) ----------

  function eraBadge(era){
    if(!era) return '';
    const cls = era.includes('1944') ? 'e1944' : (era.includes('1940') ? 'e1940' : '');
    return `<span class="era ${cls}">${escapeHTML(era)}</span>`;
  }

  async function viewLanding(){
    const data = await getManifest();
    const rows = data.chapters.map(ch=>{
      const pub = isPublished(ch);
      const num = String(ch.number).padStart(2,'0');
      if(pub){
        return `
        <a class="file-row" href="#/chapter/${ch.id}">
          <div class="num">Дело №<br><span>${num}</span></div>
          <div class="meta">
            <p class="title">${escapeHTML(ch.title)}</p>
            ${eraBadge(ch.era)}
          </div>
          <div class="status">опубл. ${fmtDate(ch.publish_date)}</div>
        </a>`;
      }
      return `
        <div class="file-row locked">
          <div class="num">Дело №<br><span>${num}</span></div>
          <div class="meta">
            <p class="title">${escapeHTML(ch.title)}</p>
            ${eraBadge(ch.era)}
          </div>
          <div class="status">рассекречивание<br>${fmtDate(ch.publish_date)}</div>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="grain"></div>
      <header class="topbar">
        <a class="brand" href="#/"><b>Дело</b> в Ницце: Пилигрим</a>
        <div class="topbar-controls">
          <span class="eyebrow">アイダ ミール</span>
        </div>
      </header>

      <section class="hero">
        <span class="stamp">EYES ONLY</span>
        <h1>Дело в Ницце:<br>Пилигрим</h1>
        <div class="sub">роман · УСС · 1940–1944</div>
        <p class="lede">
          Агента посылают убить человека, которого он, возможно, уже знает.
          Досье собирается по главам — Ницца сорокового, Бретань
          сорок четвёртого, и фотография, которую кто-то подложил
          в папку с приказом.
        </p>
        <div class="byline">Автор: アイダ ミール · Floke Studio</div>
      </section>

      <div class="perforation"></div>

      <section class="dossier">
        <h2>Содержимое дела</h2>
        ${rows}
      </section>

      <footer class="site">© アイダ ミール. Текст обновляется по главам.</footer>
    `;
  }

  async function viewChapter(id){
    const data = await getManifest();
    const idx = data.chapters.findIndex(c=>c.id===id);
    const ch = data.chapters[idx];

    if(!ch){
      root.innerHTML = `<div class="reader"><p class="eyebrow">Дело не найдено</p>
        <p><a href="#/">← вернуться к делу</a></p></div>`;
      return;
    }
    if(!isPublished(ch)){
      root.innerHTML = `
        <header class="topbar">
          <a class="brand" href="#/"><b>Дело</b> в Ницце: Пилигрим</a>
        </header>
        <div class="reader">
          <p class="eyebrow">Засекречено</p>
          <h1 style="font-style:italic">${escapeHTML(ch.title)}</h1>
          <p>Эта глава будет рассекречена ${fmtDate(ch.publish_date)}.</p>
          <p><a href="#/">← вернуться к содержимому дела</a></p>
        </div>`;
      return;
    }

    const res = await fetch(ch.file, { cache:'no-store' });
    const raw = await res.text();
    const { meta, glossary, body } = parseChapter(raw);
    const html = renderBody(body, glossary);

    const prev = data.chapters[idx-1];
    const next = data.chapters[idx+1];
    const prevPub = prev && isPublished(prev);
    const nextPub = next && isPublished(next);

    root.innerHTML = `
      <header class="topbar">
        <a class="brand" href="#/"><b>Дело</b> в Ницце: Пилигрим</a>
        <div class="topbar-controls">
          <button id="font-minus" aria-label="Уменьшить шрифт">A−</button>
          <button id="font-plus" aria-label="Увеличить шрифт">A+</button>
          <button id="toggle-dark" aria-label="Тёмный режим">${settings.dark ? '☀' : '☾'}</button>
        </div>
      </header>
      <article class="reader">
        <div class="chapter-head">
          <div class="num">Дело № ${String(ch.number).padStart(2,'0')} · ${escapeHTML(meta.era || ch.era || '')}</div>
          <h1>${escapeHTML(meta.title || ch.title)}</h1>
          <div class="when">${escapeHTML(meta.date || '')}</div>
        </div>
        ${meta.epigraph ? `
        <div class="epigraph">
          «${renderInline(meta.epigraph)}»
          <cite>${renderInline(meta.epigraph_source || '')}</cite>
        </div>` : ''}
        <div class="prose">${html}</div>

        <nav class="chapter-nav">
          <div>${prev ? (prevPub ? `<a href="#/chapter/${prev.id}">← ${escapeHTML(prev.title)}</a>` : `<span class="ghost">← засекречено</span>`) : ''}</div>
          <div>${next ? (nextPub ? `<a href="#/chapter/${next.id}">${escapeHTML(next.title)} →</a>` : `<span class="ghost">скоро →</span>`) : `<a href="#/">в начало дела →</a>`}</div>
        </nav>
      </article>
    `;

    bindTermHandlers(root.querySelector('.reader'), glossary);
    applyReaderSettings();

    document.getElementById('font-plus').onclick = ()=>{ settings.size = Math.min(1.4, settings.size+0.1); applyReaderSettings(); };
    document.getElementById('font-minus').onclick = ()=>{ settings.size = Math.max(0.8, settings.size-0.1); applyReaderSettings(); };
    document.getElementById('toggle-dark').onclick = (e)=>{ settings.dark = !settings.dark; e.target.textContent = settings.dark ? '☀' : '☾'; applyReaderSettings(); };

    window.scrollTo(0,0);
  }

  // ---------- роутер ----------

  async function route(){
    closeTooltip();
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/chapter\/([\w-]+)/);
    if(m){
      await viewChapter(m[1]);
    } else {
      await viewLanding();
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);

  return { route };
})();
