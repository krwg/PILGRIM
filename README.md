# Пилигрим

Статический сайт-читалка романа «Пилигрим». Без сборки: HTML, CSS, JavaScript, главы в Markdown.

## Запуск локально

```powershell
.\serve.ps1
```

Откройте адрес из консоли (обычно http://localhost:8000).

## Возможности

- Прогресс чтения и «продолжить с того места»
- Темы, размер шрифта, межстрочный интервал, узкая колонка
- PWA: можно добавить на экран телефона
- Офлайн-шрифты в `assets/fonts/`

## Структура

```
index.html
manifest.json
sw.js
assets/
chapters/manifest.json
chapters/ch01.txt
tools/
```

## Формат главы

См. `chapters/_TEMPLATE.md`.

## Публикация

GitHub Pages из ветки `main`:

1. **Settings → Pages → Build and deployment** — источник **GitHub Actions**, workflow **Deploy static site** (не Jekyll).
2. В корне обязателен пустой файл `.nojekyll` — Jekyll не обрабатывает главы как HTML.
3. Главы — `chapters/ch01.txt`. Метаданные в блоке `::chapter::` … `::/chapter::` (не `---` YAML: Jekyll на GitHub Pages его съедает).
4. Иллюстрации — `assets/img/`, блок `::figure::`. Под каждой автоматически: «Изображение сгенерировано Google Gemini».
5. Глава 2: `node tools/convert-ch02.mjs` → `ch02.txt`. Иллюстрации — `assets/img/ch02-*.png` (12 шт.: billet, train, vokzal, taxi, pension, diner, marche, promenade, fontaine, jardin, port, traction).
