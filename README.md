<!-- EN / RU switcher -->
<p align="center">
  <a href="#pilgrim-en">🇬🇧 English</a> · <a href="#pilgrim-ru">🇷🇺 Русский</a>
</p>

---

<a name="pilgrim-en"></a>
<h1 align="center">Piligrim</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="License"></a>
  <a href="https://krwg.github.io/piligrim/"><img src="https://img.shields.io/badge/GitHub_Pages-live-brightgreen?style=flat-square&logo=github" alt="GitHub Pages"></a>
  <img src="https://img.shields.io/badge/PWA-installable-purple?style=flat-square&logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  <strong><a href="https://krwg.github.io/piligrim/">Read online →</a></strong>
</p>

<p align="center"><em>A static, zero-build novel reader for <strong>Piligrim</strong> — a USS espionage novel set in Nice (1940) and Brittany (1944). HTML · CSS · Vanilla JS. Chapters in a custom Markdown dialect. Works offline.</em></p>

---

## Features

| | |
|:---|:---|
| **Reading progress** | Saves your place automatically; resume where you left off |
| **Themes & typography** | Light/dark mode, font size, line height, narrow column layout |
| **PWA** | Installable on mobile; works offline with cached fonts and chapters |
| **Offline fonts** | Self-hosted typefaces in `assets/fonts/` — no external requests |
| **Footnotes & documents** | Inline glossary tooltips (`[[n]]`) and archival document blocks |
| **AI illustrations** | Chapter figures with auto-caption: *"Изображение сгенерировано Google Gemini"* |

## Chapters

| # | Title | Era | Status |
|---|-------|-----|--------|
| 1 | EYES ONLY (Только для глаз) | 1944 · Paris | published |
| 2 | Coup de Soleil (Солнечный удар) | 1940 · Nice | published |
| 3 | Beobachtung (Наблюдение) | 1944 · Brittany | soon |
| 4 | BUREAU DE PRESSE (Бюро печати) | 1940 · Nice | soon |

Registry: `chapters/manifest.json`.

## Quick Start

**Requirements:** [Node.js](https://nodejs.org/) 18+ (for the local dev server only — the site itself has no build step).

```powershell
git clone https://github.com/krwg/piligrim.git
cd piligrim
.\serve.ps1
```

Then open the address from the console (usually `http://localhost:8000`).

Alternative (cross-platform):

```bash
npm run serve
# or with a custom port:
.\serve.ps1 3000
```

> **Note:** A plain `file://` open won't work — the reader fetches chapters via HTTP. Always use the dev server or GitHub Pages.

## Project Structure

```
piligrim/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline cache)
├── serve.ps1               # Windows launcher → tools/serve.mjs
├── package.json            # npm scripts (serve, convert)
├── .nojekyll               # Disables Jekyll on GitHub Pages
├── .github/workflows/
│   └── pages.yml           # Deploy static site (GitHub Actions)
├── assets/
│   ├── fonts/              # Offline typefaces
│   └── img/                # Chapter illustrations & PWA icons
├── chapters/
│   ├── manifest.json       # Chapter registry (title, era, status)
│   ├── ch01.txt            # Published chapter content
│   ├── ch02.txt
│   └── _TEMPLATE.md        # Chapter format reference
└── tools/
    ├── serve.mjs           # Local static server
    ├── convert-chapter.mjs # Source MD → chapter .txt
    ├── convert-ch02.mjs    # Chapter 2 conversion script
    └── glossary-*.mjs      # Footnote enrichment helpers
```

## Chapter Format

See [`chapters/_TEMPLATE.md`](chapters/_TEMPLATE.md).

**Metadata** — inside a `::chapter::` … `::/chapter::` block (not YAML `---` front-matter: Jekyll on GitHub Pages swallows `---` blocks):

```
::chapter::
title: Chapter Title (Translation)
when: Month Year, City
era: 1944 · City
epigraph: |
  Quote text.
epigraph_source: "Source"
::/chapter::
```

**Other blocks:**

| Block | Purpose |
|-------|---------|
| `::figure::` … `::/figure::` | Illustration + caption; image path under `assets/img/` |
| `:::document` … `:::` | Archival inserts (labels, meta, epigraphs, handwriting) |
| `word[[1]]` + `[[1]]: definition` | Inline glossary tooltips |

Under every figure the reader adds automatically: *«Изображение сгенерировано Google Gemini»*.

## Authoring & Tools

### Convert a chapter from source Markdown

Edit paths in `tools/convert-chapter.mjs`, then:

```bash
npm run convert
```

Chapter 2 has a dedicated script:

```bash
node tools/convert-ch02.mjs
```

Output: `chapters/ch02.txt` + 12 illustrations in `assets/img/ch02-*.png`:

`billet` · `train` · `vokzal` · `taxi` · `pension` · `diner` · `marche` · `promenade` · `fontaine` · `jardin` · `port` · `traction`

### Register a new chapter

1. Add an entry to `chapters/manifest.json` (`id`, `title`, `era`, `status`, `file`).
2. Place the `.txt` file in `chapters/`.
3. Add the file path to the service worker cache list in `sw.js` (if offline support is needed).

## Publishing to GitHub Pages

1. **Settings → Pages → Build and deployment** — source: **GitHub Actions**, workflow **Deploy static site** (not Jekyll).
2. Keep an empty `.nojekyll` in the repo root — prevents Jekyll from processing chapter files.
3. Push to `main` — workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) deploys the repo as-is (no build step).
4. Live URL: **https://krwg.github.io/piligrim/**

## License

Code and site engine: [GNU GPL v3](LICENSE).

---

<a name="pilgrim-ru"></a>
<h1 align="center">Пилигрим</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="License"></a>
  <a href="https://krwg.github.io/piligrim/"><img src="https://img.shields.io/badge/GitHub_Pages-онлайн-brightgreen?style=flat-square&logo=github" alt="GitHub Pages"></a>
  <img src="https://img.shields.io/badge/PWA-установить-purple?style=flat-square&logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  <strong><a href="https://krwg.github.io/piligrim/">Читать онлайн →</a></strong>
</p>

<p align="center"><em>Статическая читалка романа «Пилигрим» — шпионский роман об УСС: Ницца 1940, Бретань 1944. Без сборки: HTML, CSS, JavaScript. Главы в собственном Markdown-формате. Работает офлайн.</em></p>

---

## Возможности

| | |
|:---|:---|
| **Прогресс чтения** | Автосохранение позиции; продолжить с того места |
| **Темы и типографика** | Светлая/тёмная тема, размер шрифта, межстрочный интервал, узкая колонка |
| **PWA** | Установка на телефон; работа офлайн с кэшированными шрифтами и главами |
| **Офлайн-шрифты** | Локальные шрифты в `assets/fonts/` — без внешних запросов |
| **Сноски и документы** | Всплывающие подсказки (`[[n]]`) и блоки архивных вставок |
| **AI-иллюстрации** | Автоподпись под каждым изображением: «Изображение сгенерировано Google Gemini» |

## Главы

| № | Название | Эпоха | Статус |
|---|----------|-------|--------|
| 1 | EYES ONLY (Только для глаз) | 1944 · Париж | опубликована |
| 2 | Coup de Soleil (Солнечный удар) | 1940 · Ницца | опубликована |
| 3 | Beobachtung (Наблюдение) | 1944 · Бретань | скоро |
| 4 | BUREAU DE PRESSE (Бюро печати) | 1940 · Ницца | скоро |

Реестр: `chapters/manifest.json`.

## Быстрый старт

**Нужно:** [Node.js](https://nodejs.org/) 18+ (только для локального сервера — сам сайт не собирается).

```powershell
git clone https://github.com/krwg/piligrim.git
cd piligrim
.\serve.ps1
```

Откройте адрес из консоли (обычно `http://localhost:8000`).

Альтернатива (Windows / macOS / Linux):

```bash
npm run serve
# или другой порт:
.\serve.ps1 3000
```

> **Важно:** через `file://` не откроется — читалка загружает главы по HTTP. Используйте локальный сервер или GitHub Pages.

## Структура проекта

```
piligrim/
├── index.html              # Точка входа
├── manifest.json           # Манифест PWA
├── sw.js                   # Service worker (офлайн-кэш)
├── serve.ps1               # Запуск сервера (Windows)
├── package.json            # npm-скрипты (serve, convert)
├── .nojekyll               # Отключает Jekyll на GitHub Pages
├── .github/workflows/
│   └── pages.yml           # Деплой статики (GitHub Actions)
├── assets/
│   ├── fonts/              # Локальные шрифты
│   └── img/                # Иллюстрации и иконки PWA
├── chapters/
│   ├── manifest.json       # Реестр глав
│   ├── ch01.txt            # Опубликованная глава
│   ├── ch02.txt
│   └── _TEMPLATE.md        # Справка по формату
└── tools/
    ├── serve.mjs           # Локальный сервер
    ├── convert-chapter.mjs # Конвертация MD → .txt
    ├── convert-ch02.mjs    # Скрипт для главы 2
    └── glossary-*.mjs      # Обогащение сносок
```

## Формат главы

См. [`chapters/_TEMPLATE.md`](chapters/_TEMPLATE.md).

**Метаданные** — в блоке `::chapter::` … `::/chapter::` (не YAML `---`: Jekyll на GitHub Pages съедает такие блоки):

```
::chapter::
title: Название главы (Перевод)
when: Месяц год, Город
era: 1944 · Город
epigraph: |
  Текст эпиграфа.
epigraph_source: "Источник"
::/chapter::
```

**Другие блоки:**

| Блок | Назначение |
|------|------------|
| `::figure::` … `::/figure::` | Иллюстрация + подпись; путь в `assets/img/` |
| `:::document` … `:::` | Архивные вставки (метки, штампы, эпиграфы, пометки на полях) |
| `слово[[1]]` + `[[1]]: пояснение` | Всплывающие термины |

Под каждой иллюстрацией читалка автоматически добавляет: «Изображение сгенерировано Google Gemini».

## Инструменты автора

### Конвертация главы из исходного Markdown

Отредактируйте пути в `tools/convert-chapter.mjs`, затем:

```bash
npm run convert
```

Для главы 2 — отдельный скрипт:

```bash
node tools/convert-ch02.mjs
```

Результат: `chapters/ch02.txt` + 12 иллюстраций в `assets/img/ch02-*.png`:

`billet` · `train` · `vokzal` · `taxi` · `pension` · `diner` · `marche` · `promenade` · `fontaine` · `jardin` · `port` · `traction`

### Добавление новой главы

1. Запись в `chapters/manifest.json` (`id`, `title`, `era`, `status`, `file`).
2. Файл `.txt` в `chapters/`.
3. Путь к файлу в кэше service worker (`sw.js`) — для офлайн-режима.

## Публикация на GitHub Pages

1. **Settings → Pages → Build and deployment** — источник: **GitHub Actions**, workflow **Deploy static site** (не Jekyll).
2. В корне обязателен пустой `.nojekyll`.
3. Push в `main` — workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) деплоит репозиторий как есть (без сборки).
4. Адрес: **https://krwg.github.io/piligrim/**

## Лицензия

Код и движок сайта: [GNU GPL v3](LICENSE).

<p align="center"><a href="#pilgrim-en">⬆️ Back to top / Наверх</a></p>

