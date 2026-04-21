Этот архив содержит минимальный frontend для модуля записи.

Что меняется:
- добавляются 3 отдельные страницы:
  - /client/booking
  - /trainer/availability
  - /trainer/booking-requests
- добавляются отдельные API-файлы и типы
- заменяется только frontend/src/app/router.tsx
- глобальные стили, профиль, AppLayout, MobileBottomNav не меняются

Как применить:
1. Распаковать архив в корень проекта:
   unzip -o fitapp_frontend_booking_step1.zip -d .

2. Проверить diff:
   git diff -- frontend

3. Собрать фронт:
   cd frontend
   npm run build

4. Если сборка ок — поднять контейнер:
   cd ..
   docker compose -f compose.yaml -f docker-compose.local.yml up -d --build frontend

Проверка:
- клиент:  http://localhost:3000/client/booking
- тренер:  http://localhost:3000/trainer/availability
- тренер:  http://localhost:3000/trainer/booking-requests
