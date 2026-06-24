import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichSpravka } from './glossary-rich.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../chapters/02-COUP-DE-SOLEIL.md');
const DST = path.resolve(__dirname, '../chapters/ch02.txt');

const FIGURES = [
  {
    after: 'обещающий ещё один день, в котором можно притвориться, что мир не рухнул вчера в Париже.',
    block: `::figure::
assets/img/ch02-billet.png
Билет третьего класса на имя «Джеймс Келлер» и пропуск Виши — в кармане пиджака, натёртом до бархатного блеска.
::/figure::`,
  },
  {
    after: 'Шанхай[77], тридцать седьмого.',
    block: `::figure::
assets/img/ch02-train.png
Поезд Марсель — Ницца. Купе, Эстерель, льняной костюм легенды.
::/figure::`,
  },
  {
    after: 'в нём хотелось раствориться, а не думать.',
    block: `::figure::
assets/img/ch02-vokzal.png
Вокзал Ниццы, 14 июня 1940. Перрон, купол, жара.
::/figure::`,
  },
  {
    after: 'Солнце пробивалось сквозь листву пятнами, золотыми, ленивыми.',
    block: `::figure::
assets/img/ch02-taxi.png
Citroën на rue de la Buffa. Глициния, золотые пятна солнца.
::/figure::`,
  },
  {
    after: 'Он остановился у жёлтого дома, утопающего в глицинии, как корабль в цветах.',
    block: `::figure::
assets/img/ch02-pension.png
Пансион Оден, rue de la Buffa, 17. Июнь 1940.
::/figure::`,
  },
  {
    after: 'Вода была холодной; стекло запотело.',
    block: `::figure::
assets/img/ch02-diner.png
Общий стол в пансионе Оден. Ужин, 14 июня.
::/figure::`,
  },
  {
    after: 'смешивался с жасмином.',
    block: `::figure::
assets/img/ch02-marche.png
Cours Saleya: socca, очередь, жасмин и чеснок.
::/figure::`,
  },
  {
    after: 'с обещанием забытьья.',
    block: `::figure::
assets/img/ch02-promenade.png
Promenade des Anglais: пастис, шезлонги, море «как расплавленное серебро».
::/figure::`,
  },
  {
    after: 'но уже знал, что будет.',
    block: `::figure::
assets/img/ch02-fontaine.png
У фонтана на набережной: Ларош, женщина с папкой, спор о «спокойствии» и хлебе.
::/figure::`,
  },
  {
    after: 'другим маршрутом и другим страхом.',
    block: `::figure::
assets/img/ch02-jardin.png
Jardin Albert I, вечер 15 июня. Миндаль, пальмы, сумерки.
::/figure::`,
  },
  {
    after: 'Оставил «утро».',
    block: `::figure::
assets/img/ch02-port.png
Порт Ниццы, утро 16 июня. Рыбаки, сети, смех.
::/figure::`,
  },
  {
    after: 'Угол загнут внутрь.',
    block: `::figure::
assets/img/ch02-traction.png
«Citroën Traction Avant» напротив пансиона. «Paris-Soir», угол загнут внутрь. Ночь 16 июня.
::/figure::`,
  },
];

const frontmatter = `::chapter::
title: Coup de Soleil (Солнечный удар)
when: 14–16 июня 1940, Ницца
era: 1940 · Ницца
epigraph: |
  Легенда — это не просто история. Это ваша вторая кожа. Вы должны дышать ею,
  потеть ею, верить в неё больше, чем в своё собственное имя.
epigraph_source: "Инструкция для агентов УСС[[1]] перед внедрением"
::/chapter::

`;

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

const spravkaDefs = new Map();
const out = [];
let inSpravka = false;
let i = 0;

while (i < lines.length && !lines[i].match(/^### Поезд/)) i++;

for (; i < lines.length; i++) {
  let line = lines[i];

  if (line.match(/^\*Справка на полях/)) {
    inSpravka = true;
    continue;
  }

  if (inSpravka) {
    const m = line.match(/^\*\*\[(\d+)\]\s*(.+?)\*\*\s*—\s*(.+)$/);
    if (m) {
      spravkaDefs.set(m[1], `${m[2].trim()} — ${m[3].trim()}`);
    }
    if (line.match(/^\*Далее/)) continue;
    continue;
  }

  if (line.match(/^# ГЛАВА/)) continue;
  if (line.match(/^\*14–17 июня/)) continue;
  if (line.match(/^> «Легенда/)) continue;
  if (line.match(/^> — Инструкция/)) continue;

  if (line.match(/^### /)) {
    out.push('');
    out.push(`__${line.replace(/^###\s*/, '').trim()}__`);
    out.push('');
    continue;
  }

  if (line.trim() === '---') {
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

  if (!line.trim()) {
    out.push('');
    continue;
  }

  let processed = line
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '__$1__');

  out.push(processed);

  for (const fig of FIGURES) {
    if (processed.includes(fig.after)) {
      out.push('');
      out.push(fig.block);
      out.push('');
    }
  }
}

let bodyText = out.join('\n');

enrichSpravka(spravkaDefs, bodyText);

const figureHolds = [];
bodyText = bodyText.replace(/::figure::[\s\S]*?::\/figure::/g, block => {
  figureHolds.push(block);
  return `@@FIGHOLD${figureHolds.length - 1}@@`;
});

bodyText = bodyText.replace(/\[(\d+)\]/g, (full, id) => {
  if (spravkaDefs.has(id)) return `[[${id}]]`;
  return '';
});

bodyText = bodyText.replace(/@@FIGHOLD(\d+)@@/g, (_, i) => figureHolds[Number(i)]);

const glossaryOrder = [...spravkaDefs.keys()].sort((a, b) => Number(a) - Number(b));
const glossary = glossaryOrder.map(id => `[[${id}]]: ${spravkaDefs.get(id)}`);

const body = (bodyText + '\n\n' + glossary.join('\n\n')).replace(/\n{3,}/g, '\n\n').trim();
fs.writeFileSync(DST, frontmatter + body + '\n', 'utf8');
console.log('ch02.txt:', body.split('\n').length, 'lines,', glossary.length, 'terms,', FIGURES.length, 'figures');
