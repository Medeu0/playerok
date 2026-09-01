# Manual QA

## Viewports
- [ ] Mobile 360 px
- [ ] Mobile 390 px
- [ ] Mobile 430 px
- [ ] Desktop 1280 px+

## Features
- [ ] Навигация и browser reload
- [ ] Quiz 10/20/30, категории, explanations, retry mistakes, best score
- [ ] Flashcards и сохранение «знал / не знал»
- [ ] Checklist, server checklist и readiness
- [ ] Server notes остаются после reload
- [ ] Bookmarks и глобальный поиск (MG / склад / КамАЗ)
- [ ] Reset с подтверждением; export/import
- [ ] Source links открываются в новой вкладке
- [ ] Changelog и verified indicator
- [ ] Частые ошибки, mini quiz и breakdown результата по категориям
- [ ] Keyboard focus, screen-reader labels и touch targets
- [ ] Offline reload после первого online открытия

## Dataset resilience
- [ ] SKU с менее чем 10 вопросами показывает «Все», не повторяет вопросы и завершает quiz
- [ ] Пустой generated skeleton показывает empty states, а не падает
- [ ] Старый localStorage после обновления dataset не даёт progress выше 100%
