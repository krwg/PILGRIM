import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichSpravka } from './glossary-rich.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../chapters/01-EYES-ONLY.md');
const DST = path.resolve(__dirname, '../chapters/ch01.txt');

const FIGURES = [
  {
    after: 'исчезновение было официальным.',
    block: `::figure::
assets/img/lutetia.png
Очередь у «Лютетии», октябрь 1944. Женщина ищет мужа по снимку в руках.
::/figure::`,
  },
  {
    after: 'словно убивали не человека, а распорядок дня.',
    block: `::figure::
assets/img/villascheme.png
Схема виллы Ker Izella — в папке «TÖTUNG». Балкон E, 07:15.
::/figure::`,
  },
  {
    after: 'GRU — «decade of compromise».',
    block: `::figure::
assets/img/B-417.png
Аэрофотоснимок B-417, сетка F-8. Ker Izella, Pont-Aven. Частичная облачность.
::/figure::

::figure::
assets/img/SNCF.png
Таблица патрулей SNCF: Brest, Quimper, Lorient. Октябрь 1944.
::/figure::`,
  },
  {
    after: 'четыре года в чужом архиве.',
    block: `::figure::
assets/img/annex-a.png
Promenade des Anglais, 14 июня 1940. Угол «Paris-Soir» загнут внутрь — знак наблюдателя.
Приложение A
::/figure::`,
  },
  {
    after: 'Подтвердить. Ликвидировать.',
    block: `::figure::
assets/img/weber.png
Фото для идентификации цели. Hptm. Otto Friedrich Weber.
::/figure::`,
  },
];

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

const frontmatter = `::chapter::
title: EYES ONLY (Только для глаз)
when: Октябрь 1944 г., Париж
era: 1944 · Париж
epigraph: |
  Оперативник должен быть свободен от личных привязанностей. Они —
  слабое звено в цепи безопасности. Любая эмоциональная вовлечённость
  подлежит немедленному докладу куратору.
epigraph_source: "Полевое руководство УСС, Раздел 4: «Психологическая готовность»"
::/chapter::

`;

const EXHIBIT_TRANSLATE = `
::translate::
**УПРАВЛЕНИЕ СТРАТЕГИЧЕСКИХ СЛУЖБ**
**Европейский театр военных действий — отдел специальных операций**

**ОПЕРАЦИЯ**: «GRAYSCALE»
**ССЫЛКА**: GRS/44-01-E
**ДАТА**: 22 октября 1944
**ГРИФ**: EYES ONLY – УРОВЕНЬ 4
**РАСПРОСТРАНЕНИЕ**: ОДИН ЭКЗЕМПЛЯР УКАЗАННОМУ АГЕНТУ

**ЦЕЛЬ**

Гпт. Отто Фридрих Вебер, Abwehr III-F (диверсия и контрразведка). Прикомандирован к Abstelle Paris, 1941–1944.

**МЕСТОНАХОЖДЕНИЕ**

Предположительно вилла «Ker Izella», ~3 км к северо-востоку от Pont-Aven, Finistère, Бретань. Ссылка: аэрофотоснимок **B-417**, сетка **F-8** __(частичная облачность)__.

**СВЕДЕНИЯ**

Принстонский университет, 1932–1936 (строительная инженерия). Завербован абвером в 1938 через академические контакты. Английский (акцент Mid-Atlantic), французский (свободно). Профиль: интеллектуал, педантичен, **низкая склонность к насилию**. Диверсии: точечное поражение инфраструктуры, минимальные побочные потери.

**СТАТУС (с авг. ’44–)**

Отрезан от берлинского командования. Активно ищет контакт с ГРУ через нейтральные каналы в Бретани. Цель: обменять «Чёрные дневники» на личную эвакуацию на восток.

**ОЦЕНКА УГРОЗЫ**

**ВЫСОКАЯ.** «Чёрные дневники» — рукописные реестры агентурных сетей, тайников, каналов финансирования по Франции и Benelux, 1940–1944. Материал **оперативный**, не исторический. Передача СССР = ~10 лет компрометации послевоенной инфраструктуры.

**РАЗРЕШЕНИЕ НА ЛИКВИДАЦИЮ**

Выдано. Уровень 4. Чисто. Без следов. Предпочтительный метод: чистая ликвидация с дистанции (снайперская винтовка).

**ЗАДАЧА ALPHA**

Подтвердить личность цели (фото в приложении A). Изъять / уничтожить «Дневники» — коричневая кожа, ~15×10 см, латунная застёжка. **ПРИОРИТЕТ ALPHA.**

**АГЕНТ**

«JANUS» (J. Clark). Активирован **22.10.44**.

**КОДОВЫЕ ФРАЗЫ**

**Отмена / смена**: «Туман в проливе густой.»
**Успех / эвакуация**: «Товар отгружен.»

::hand-ru::

Приложение A вложено. Фото Ницца, июнь 1940. Объект («Janus») связан с местным активом «MARGUERITE D.» — перекрёстная ссылка GESTAPO Lyon **417-L**. Отношение к «GRAYSCALE»: не подтверждено, маловероятно. Только для ориентира. **НЕ РАССЛЕДОВАТЬ.** Основная цель: Вебер + Дневники. Эмоциональная вовлечённость = операционная угроза.

__Пусть мёртвые хоронят своих мёртвых.__
`.trim();

function cleanMd(s) {
  return s
    .replace(/\[\[\d+\]\]/g, '')
    .replace(/\[(\d+)\]/g, '')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function italicize(s) {
  return s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '__$1__');
}

function isTableRow(line) {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|');
}

function flattenTable(rows) {
  const out = [];
  for (const row of rows) {
    const t = row.trim();
    if (/^\|[\s\-:|]+\|$/.test(t)) continue;
    const cells = t.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length === 2) out.push(`${cells[0]}: ${cells[1]}`);
    else if (cells.length) out.push(cells.join(' · '));
  }
  return out;
}

function isDocEnd(line) {
  const t = line.trim();
  return t === '**E.**' || t === '> **E.**' || /^>\s*\*\*E\.\*\*\s*$/.test(t);
}

const spravkaDefs = new Map();
const out = [];
let i = 0;
let inSpravka = false;
let inDocument = false;
let tableBuf = [];

while (i < lines.length && !lines[i].match(/^Дождь шёл/)) i++;

for (; i < lines.length; i++) {
  let line = lines[i];

  if (line.match(/^\*Справка на полях/)) {
    if (inDocument) { out.push(':::'); inDocument = false; }
    inSpravka = true;
    continue;
  }

  if (inSpravka) {
    const m = line.match(/^\*\*\[(\d+)\]\s*(.+?)\*\*\s*—\s*(.+)$/);
    if (m) {
      spravkaDefs.set(m[1], `${cleanMd(m[2])} — ${cleanMd(m[3])}`);
    }
    continue;
  }

  if (line.match(/^## ДОКУМЕНТ/)) {
    if (inDocument) { out.push(':::'); out.push(''); }
    inDocument = true;
    out.push('');
    out.push(':::document');
    out.push(`::label:: ${line.replace(/^##\s*/, '').trim()}`);
    continue;
  }

  if (inDocument && line.match(/^\*Лист /)) {
    if (tableBuf.length) { out.push(...flattenTable(tableBuf)); tableBuf = []; }
    out.push('::meta::');
    continue;
  }

  if (inDocument && line.match(/^>\s*«Цель не является/)) {
    if (tableBuf.length) { out.push(...flattenTable(tableBuf)); tableBuf = []; }
    let quote = line.replace(/^>\s*/, '').trim();
    let cite = '';
    let j = i + 1;
    while (j < lines.length && lines[j].match(/^>\s*/)) {
      const part = lines[j].replace(/^>\s*/, '').trim();
      if (part.match(/^—\s*(?:\*Auszug:\*\s*)?/i)) {
        cite = part.replace(/^—\s*(?:\*Auszug:\*\s*)?/i, '').trim();
      } else if (part) {
        quote += (quote ? ' ' : '') + part;
      }
      j++;
    }
    i = j - 1;
    const ep = cite ? `${cleanMd(quote)}|||${cleanMd(cite)}` : cleanMd(quote);
    out.push(`::epigraph:: ${ep}`);
    continue;
  }

  if (inDocument && line.match(/^\*Нижнее поле/)) {
    if (tableBuf.length) { out.push(...flattenTable(tableBuf)); tableBuf = []; }
    const handLines = [];
    let j = i + 1;
    while (j < lines.length && !isDocEnd(lines[j])) {
      const l = lines[j];
      if (l.match(/^>\s*/)) {
        const t = l.replace(/^>\s*/, '').trim();
        if (t) handLines.push(t);
      }
      j++;
    }
    out.push(...EXHIBIT_TRANSLATE.split('\n'));
    out.push('');
    out.push('::hand-meta::');
    out.push('');
    for (const hl of handLines) {
      out.push(italicize(hl));
      out.push('');
    }
    if (j < lines.length && isDocEnd(lines[j])) {
      out.push(':::');
      inDocument = false;
      i = j;
    }
    continue;
  }

  if (inDocument && line.match(/^>\s*/) && !line.match(/^>\s*«Цель/)) {
    continue;
  }

  if (inDocument && isTableRow(line)) {
    tableBuf.push(line);
    continue;
  } else if (tableBuf.length) {
    out.push(...flattenTable(tableBuf));
    tableBuf = [];
  }

  if (inDocument && isDocEnd(line)) {
    out.push(':::');
    inDocument = false;
    continue;
  }

  if (line.match(/^# ГЛАВА/)) continue;
  if (line.match(/^\*Октябрь 1944/)) continue;
  if (line.match(/^> «Оперативник/)) continue;
  if (line.match(/^> — Полевое/)) continue;

  if (line.trim() === '---') {
    if (inDocument) continue;
    out.push('');
    out.push('***');
    out.push('');
    continue;
  }

  if (line.match(/^\*\(.+\)\*$/)) {
    out.push('');
    out.push(`__${line.replace(/^\*|\*$/g, '')}__`);
    out.push('');
    continue;
  }

  if (line.match(/^\*«.+»\*$/) || (line.match(/^\*[^*].*\*$/) && !line.includes('Справка'))) {
    const label = line.replace(/^\*|\*$/g, '');
    if (!label.includes('Нижнее') && !label.startsWith('Лист ')) {
      out.push('');
      out.push(`__${label}__`);
      out.push('');
      continue;
    }
  }

  if (!line.trim()) {
    out.push('');
    continue;
  }

  const processed = italicize(line);
  out.push(processed);

  for (const fig of FIGURES) {
    if (processed.includes(fig.after)) {
      out.push('');
      out.push(fig.block);
      out.push('');
    }
  }
}

if (inDocument) {
  if (tableBuf.length) out.push(...flattenTable(tableBuf));
  out.push(':::');
}

let bodyText = out.join('\n');
enrichSpravka(spravkaDefs, bodyText);

const figureHolds = [];
bodyText = bodyText.replace(/::figure::[\s\S]*?::\/figure::/g, block => {
  figureHolds.push(block);
  return `@@FIGHOLD${figureHolds.length - 1}@@`;
});

const refOrder = [];
const seen = new Set();
for (const m of bodyText.matchAll(/\[(\d+)\]/g)) {
  const id = m[1];
  if (spravkaDefs.has(id) && !seen.has(id)) {
    refOrder.push(id);
    seen.add(id);
  }
}
const remap = {};
refOrder.forEach((old, idx) => { remap[old] = String(idx + 1); });

bodyText = bodyText.replace(/\[(\d+)\]/g, (full, id) => {
  if (remap[id]) return `[[${remap[id]}]]`;
  return '';
});

bodyText = bodyText.replace(/@@FIGHOLD(\d+)@@/g, (_, i) => figureHolds[Number(i)]);

const glossary = refOrder.map(old => {
  const def = spravkaDefs.get(old);
  return `[[${remap[old]}]]: ${def}`;
});

const body = (bodyText + '\n\n' + glossary.join('\n\n')).replace(/\n{3,}/g, '\n\n').trim();
fs.writeFileSync(DST, frontmatter + body + '\n', 'utf8');
console.log('ch01.txt:', glossary.length, 'terms,', FIGURES.length, 'figure anchors');
