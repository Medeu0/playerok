# Добавление knowledge-product (для человека и AI)

1. **Research.** Определить scope SKU; использовать первичные официальные публичные источники. Не копировать большие фрагменты.
2. **Create dataset.** `npm run create-product -- police-ss`; заменить весь предметный контент шаблона.
3. **Add official sources.** Заполнить `sources.json`, publisher, URL, verifiedAt и usedBy.
4. **Mark claims.** Каждому элементу назначить `official`, `server_specific` или `training` и priority. Official всегда содержит существующий `sourceId`.
5. **Validate dataset.** `npm run validate -- --product=police-ss` и `npm run test -- --product=police-ss`.
6. **Build.** `npm run build -- --product=police-ss`.
7. **Test mobile.** Пройти QA на 360/390/430 px и desktop, проверить клавиатуру, contrast и touch targets.
8. **Ship.** Проверить disclaimer, версию/changelog, ссылки и опубликовать `dist/`.

> AI не должен автоматически превращать найденный сторонний текст в официальный факт. Каждый factual item должен иметь status и, если он official, sourceId.
