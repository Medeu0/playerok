# Grand Mobile Guide Engine

Data-driven статический тренажёр на React, TypeScript и Vite. Первый SKU — **подготовка к СС Военной Части**. Backend, аккаунты и аналитика отсутствуют; пользовательские данные остаются в `localStorage`.

## Запуск
```bash
npm install
npm run dev
```

## Production build
```bash
npm run test
npm run build
```
Готовая статика находится в `dist/`. Её можно загрузить на Netlify, Cloudflare Pages, GitHub Pages или любой static hosting. Для SKU: `npm run build -- --product=army-ss`. Prebuild собирает выбранные JSON в типизированный bundle.

## Контент
Каждый SKU расположен в `content/<slug>/`: metadata, sources, sections, rules, RP terms, scenarios, quiz, checklist, server-specific, FAQ, changelog и thresholds. Runtime-схема Zod находится в `src/data/schema.ts`; `npm run validate` выдаёт понятные ошибки. Official-элемент обязан иметь `sourceIds`.

### Добавить вопрос
Добавьте объект в `content/army-ss/quiz.json`: уникальный `id`, категорию, вопрос, варианты, индекс ответа, краткое объяснение, status/priority и sourceIds для official. Запустите validation и tests.

### Новый SKU / Police SS
1. `npm run create-product -- police-ss`.
2. Исследуйте тему и полностью замените унаследованный контент в `content/police-ss/` — шаблон не является подтверждением фактов.
3. Измените metadata, дату, источники, changelog и уникальный `storageKey`.
4. `npm run build -- --product=police-ss` (или измените `product.config.json`).

Дата актуальности меняется в `metadata.json` и у каждого source. Источник добавляется в `sources.json`, затем его id указывается в factual items. История релизов — `changelog.json`.

## Хранение и offline
Ключ localStorage задаётся в `metadata.storageKey`. Прогресс можно экспортировать/импортировать в приложении. Service Worker кеширует приложение после первого открытия; внешние official-ссылки требуют сети.
