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
Ключ localStorage задаётся в `metadata.storageKey`. Прогресс можно экспортировать/импортировать в приложении. Service Worker кеширует приложение после первого открытия; внешние official-ссылки требуют сети. Доступ к localStorage обёрнут в `src/utils/safeStorage.ts` — при недоступности (приватный режим, `file://` в некоторых браузерах) приложение не падает, а работает в рамках текущей сессии.

## Single-file продукт (для отправки покупателю)
```bash
npm run build:file -- --product=army-ss
```
Результат — один самодостаточный файл:
```text
dist/army-ss.html
```
CSS и JS встроены (`<style>`/`<script>` inline), датасет продукта встроен, никаких обращений к `/assets/*`, CDN или API не требуется — файл открывается офлайн прямо с диска (`file:///...`). Service Worker в этом режиме не регистрируется (он бессмысленен и может выдавать ошибки под `file://`).

Зачем: это canonical delivery-формат для автоматической отправки покупателю существующим Playerok-ботом (см. `docs/BOT_DELIVERY.md`) — без хостинга, backend или access API. Ограничения мобильного UX описаны в `docs/BUYER_FILE_UX.md`.

Команда сама готовит датасет (`prepare-product` + Zod-валидация), собирает Vite production build, инлайнит ассеты и проверяет результат — вручную ничего запускать заранее не нужно. Обычный хостинг-билд (`npm run build`) при этом не меняется и продолжает работать как раньше.

Следующий SKU собирается той же командой:
```bash
npm run build:file -- --product=police-ss
```

Собрать все SKU с `"releaseReady": true` в `content/<sku>/metadata.json` одной командой:
```bash
npm run build:files
```
