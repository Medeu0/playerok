# Grand Mobile Guide Engine

Data-driven статический тренажёр на React, TypeScript и Vite. Первый SKU — **Подготовка к СС Военной Части**. Backend, аккаунты и analytics отсутствуют: пользовательские данные остаются в `localStorage`.

## Запуск
```bash
npm install
npm run validate -- --product=army-ss
npm run audit -- --product=army-ss
npm run test
npm run build -- --product=army-ss
npm run dev -- --product=army-ss
```
`dev` и `build` сначала собирают выбранные JSON во временный `src/generated/product.json`. Артефакт игнорируется Git, поэтому закоммиченный bundle не может разойтись с `product.config.json`. Без `--product` используется config.

Готовая статика находится в `dist/`. Её можно загрузить на Netlify, Cloudflare Pages, GitHub Pages или любой static hosting.

## Контент
Каждый SKU расположен в `content/<slug>/`: metadata, sources, sections, rules, RP terms, scenarios, quiz, checklist, common mistakes, quick prep, server-specific, FAQ, changelog и thresholds. Runtime-схема Zod находится в `src/data/schema.ts`; `npm run validate -- --product=<slug>` выводит ошибки структуры. `npm run audit` выполняет более строгие content/release проверки. Official-элемент обязан иметь существующий `sourceIds`.

### Добавить вопрос
Добавьте объект в `content/army-ss/quiz.json`: уникальный `id`, категорию, вопрос, уникальные варианты, индекс ответа, объяснение, status/priority и sourceIds для official. Запустите validation, audit и tests.

### Безопасный skeleton нового SKU
`npm run create-product -- police-ss` создаёт пустую структуру без Army facts, вопросов, источников, scenarios или FAQ. Генератор явно маркирует dataset как недоверенный. До исследования такой SKU выпускать нельзя.

После исследования измените metadata, labels, contamination markers, дату, источники, changelog и уникальный `storageKey`, затем заполните все JSON. Подробный workflow находится в `docs/ADDING_PRODUCT.md`.

Дата актуальности меняется в `metadata.json` и у каждого source. Источник добавляется в `sources.json`, затем его id указывается в factual items. История релизов — `changelog.json`.

## Хранение и offline
Ключ localStorage задаётся в `metadata.storageKey`. Старые неизвестные IDs безопасно игнорируются при расчётах, а проценты ограничиваются диапазоном 0–100. Прогресс можно экспортировать/импортировать. Service Worker кеширует приложение после первого открытия; внешние official-ссылки требуют сети.
