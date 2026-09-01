# Добавление knowledge-product (для человека и AI)

1. **Research.** Определить scope SKU; использовать первичные официальные публичные источники. Не копировать большие фрагменты.
2. **Create dataset.** `npm run create-product -- <slug>` создаёт только безопасный пустой skeleton. Он не копирует факты текущего SKU.
3. **Add official sources.** Заполнить `sources.json`: id, publisher, URL, verifiedAt и usedBy.
4. **Mark claims.** Каждому элементу назначить `official`, `server_specific` или `training` и priority. Official всегда содержит существующий `sourceId`.
5. **Configure UI and audit.** Заполнить `metadata.labels` без hardcode организации. В `contentMarkers.expected` добавить характерные SKU-маркеры, а в `forbidden` — маркеры соседних тематик для предупреждения о contamination.
6. **Validate and audit.** `npm run validate -- --product=<slug>`, `npm run audit -- --product=<slug>` и `npm run stats -- --product=<slug>`.
7. **Test and build.** `npm run test` и `npm run build -- --product=<slug>`.
8. **Test mobile.** Пройти `QA.md` и `PRODUCT_RELEASE_CHECKLIST.md` на 360/390/430 px и desktop.
9. **Ship.** Проверить disclaimer, версию/changelog, ссылки и опубликовать только `dist/`.

> Generated SKU contains no trusted factual content. Research and source validation are required before release.

> AI не должен автоматически превращать найденный сторонний текст в официальный факт. Каждый factual item должен иметь status и, если он official, sourceId.
