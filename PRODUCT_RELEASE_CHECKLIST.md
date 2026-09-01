# Product release checklist

Используйте отдельную копию checklist для каждого SKU перед публикацией на Playerok.

## Content
- [ ] Все `official` claims повторно проверены по первичным публичным источникам.
- [ ] Все source links открываются и ведут на заявленный материал.
- [ ] `verifiedAt` обновлена на дату последней реальной проверки.
- [ ] Server-specific требования не представлены как универсальные.
- [ ] Training-вопросы и scenarios не представлены как official.
- [ ] Нет обещаний гарантированного прохождения, «точных» или «слитых» вопросов.
- [ ] Configurable contamination markers соответствуют тематике SKU.

## Automated QA
- [ ] `npm run validate -- --product=<sku>`
- [ ] `npm run audit -- --product=<sku>`
- [ ] `npm run stats -- --product=<sku>`
- [ ] `npm run test`
- [ ] `npm run build -- --product=<sku>`

## Browser QA
Проверить 360 px, 390 px, 430 px и 1280+ px.

- [ ] Dashboard
- [ ] Quick prep во всех режимах
- [ ] Terms и flashcards
- [ ] Частые ошибки перед обзвоном
- [ ] Предметный раздел организации
- [ ] Scenarios и раскрытие логики ответа
- [ ] Quiz, difficulty mix, explanations и category results
- [ ] Retry mistakes и маленький пул вопросов
- [ ] Checklist и процент готовности
- [ ] My Server и private notes
- [ ] Search и bookmarks
- [ ] FAQ, changelog и sources
- [ ] Keyboard navigation, focus и touch targets

## Persistence
После reload сохраняются:
- [ ] Quiz results и ошибки
- [ ] Checklist
- [ ] Notes
- [ ] Bookmarks
- [ ] Общий progress
- [ ] Last page

## Release
- [ ] Создан чистый production build в `dist/`.
- [ ] Build загружен на static hosting и source links разрешены.
- [ ] Продукт открыт с реального телефона.
- [ ] Проверен fresh browser без старого localStorage/cache.
- [ ] Если PWA включена, после первого online visit проверен offline reload.
