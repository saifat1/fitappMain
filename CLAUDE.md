# FitApp

Приложение для персонального тренера и его клиентов: календарь тренировок, упражнения и подходы,
договоры (блоки тренировок), запись клиентов на свободные слоты, зарплатный отчёт тренера.

Репозиторий публичный — **никаких секретов** (паролей, токенов, ключей) в коде, коммитах и этом файле.

## Стек и структура

- `backend/` — Spring Boot 3.5, Java 21, Maven (`mvnw`), PostgreSQL, Liquibase, JWT.
  Пакеты по фичам: `training`, `trainingexercise`, `availability`, `contract`, `trainer/*`, `bookingrequest`, …
  Слои: `controller` → `service` → `repository`, DTO в `dto/`, сущности в `entity/`. Ошибки — `ApiException(code, message)`
  с сообщением на русском (его показывает фронт).
- `frontend/` — React + TypeScript + Vite. Страницы в `src/pages`, фичи в `src/features/<feature>/{model,ui,lib}`,
  API-клиенты в `src/shared/api`.
- **Новый дизайн** — `MobileShell` (`src/widgets/MobileShell.tsx`) + классы `fb-*` (`src/styles/fitapp-*.css`).
  Старый `AppLayout` и `*.module.css` — легаси; новые экраны делать только на `MobileShell`/`fb-*`.
- Docker / nginx / Caddy конфиги в корне (`compose.yaml`, `docker-compose.*.yml`).

## Правила кода

- Миграции Liquibase: `backend/src/main/resources/db/changelog/NNN-описание.yaml` + include в
  `db.changelog-master.yaml`. Нумерация сквозная (смотри последний номер в master). `ddl-auto: validate` —
  сущность должна точно совпадать со схемой.
- Не ставить уникальные ключи на «номер по порядку» в дочерних таблицах, которые перезаписываются целиком:
  Hibernate вставляет новые строки раньше, чем удаляет старые (см. `TrainingExerciseService.reconcileSetDetails`).
- Типы тренировок `TrainingType`: PERSONAL, INDEPENDENT, CIRCUIT. Какие списываются с договора —
  `TrainingType.CONTRACT_TYPES` / `drawsFromContract()`; договор списывается при завершении тренировки.
- Тексты интерфейса и сообщения об ошибках — на русском. Поля ввода на мобилке: шрифт ≥16px (иначе iOS зумит).
- Код и комментарии — в стиле окружающего кода.

## Подписка тренера (пакет `subscription`)

- Тарифы в `SubscriptionPlan`: «Старт» бесплатно до 3 клиентов, Pro 690 ₽/мес · 5 900 ₽/год до 30, Безлимит 1 190 ₽/мес ·
  9 900 ₽/год. 14 дней Pro пробно с первого визита, 3 дня отсрочки после неудачного списания. Клиенты не платят.
- Сверх лимита: рабочими остаются N клиентов (выбор тренера, `trainer_client.plan_selected`), остальные — только просмотр;
  ничего не удаляется. Проверки — `SubscriptionAccessService.assertCanAddClient / assertClientWorkable`.
- `BILLING_ENABLED` (по умолчанию false — лимитов нет, экран «скоро»). Включать на бою только вместе с реальным провайдером.
- Платёжка — через адаптер `PaymentProvider`, `BILLING_PROVIDER`: `test` (своя страница `/subscription/test-pay/:id`,
  деньги не списываются — только для дев-стенда) или `robokassa` (`RobokassaPaymentProvider`, магазин `fit_app`).
  Владелец — самозанятый; чеки в «Мой налог» — «Робочеки СМЗ» в Robokassa.
- Robokassa: `ROBOKASSA_LOGIN/PASSWORD1/PASSWORD2/TEST/HASH` только в `.env` сервера (при `ROBOKASSA_TEST=true` — тестовые пароли).
  Result URL `https://<сайт>/api/payments/notifications/robokassa` (POST), Success/Fail URL `https://<сайт>/subscription`.
  InvId = `subscription_payment.id`; автопродление — `Merchant/Recurring` с PreviousInvoiceID первого платежа (подключает поддержка).
- Публичные страницы для модерации платёжки: `/pricing`, `/legal/offer`, `/legal/refund`; реквизиты — `SELLER_*` в `.env` сервера.

## Сборка и проверка (Windows, PowerShell 5.1)

Перед командами обновить PATH и JAVA_HOME (Git, Temurin JDK 21 и Node ставились через winget):

```powershell
$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
$env:JAVA_HOME = (Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory | Where-Object Name -like "jdk-21*" | Select-Object -First 1).FullName
```

- Бэкенд: `cd backend; .\mvnw.cmd -q -DskipTests compile`
- Фронт: `cd frontend; npm run build` и `npx eslint <изменённые файлы>`
- Локально нет Postgres/Docker: бэкенд можно только скомпилировать, миграции и запуск проверяются на стенде.
  Единственный тест (`contextLoads`) требует базу.
- Git: `C:\Program Files\Git\cmd\git.exe`. Сообщение коммита с кавычками передавать файлом
  (`git commit -F file.txt`) — PowerShell 5.1 ломает кавычки в here-string. Автор коммитов — как в истории репозитория.

## Процесс работы с задачами (YouGile)

Доска: https://ru.yougile.com/team/00b1689b8043/Fit-app (вход — под аккаунтом пользователя во встроенном браузере).
Колонки (с 22.10.2026): Планирование → Fix → **В работе** → **Тест дэв** → Готово, ожидает заливки на бой → Тест прод → Готово.
Задачи ставит и проверяет Иван Сысоев.

1. Брать задачи только из «В работе», сверху вниз. Если колонка пуста — ждать, из «Fix»/«Планирования» сами не брать.
2. Проверить актуальность по коду; план не согласовывать — сразу делать. В описании задачи бывают картинки-макеты —
   смотреть их (текстовая выгрузка их не показывает).
3. Код → сборка/линтер → коммит `FIT-<номер>: <что сделано>` → пуш прямо в `main`.
4. В описание задачи **дописать** (исходный текст не трогать) раздел «ЧТО СДЕЛАНО (коммит <hash>)» с бизнес-логикой
   и раздел «ТЕСТ-КЕЙСЫ» для тестировщика в формате «ТК-N. Название / Шаги / Ожидание», с предусловиями
   (в т.ч. какие миграции должны примениться на стенде).
5. Перенести задачу в «Готово, ожидает заливки на бой» (не в «Готово»): ⋮ → Переместить → Указать место назначения →
   Fit app → Новая доска → колонка.
6. Коротко отчитаться пользователю в чате и сразу брать следующую задачу, не спрашивая.
7. **Залил на дев → перенести в «Тест дэв».** Каждый раз после выкладки на дев-стенд перенести в колонку «Тест дэв» все задачи,
   чьи коммиты попали в выложенную версию.

## Дев-стенд

https://195-208-61-184.swtest.ru — VPS `fit_app_dev`, вход по SSH-ключу `~/.ssh/fitapp_dev` (пароль не использовать).
Код в `/opt/fitappMain` (checkout `main`), `.env` только на сервере (почта и пуш выключены — в базе копия реальных клиентов).
Выкладка: `git pull --ff-only && docker compose -f compose.yaml -f docker-compose.prod.yml up -d --build`,
затем проверить в `docker logs fitapp-backend` миграции Liquibase и `Started BackendApplication`.

Уточнения — в чат задачи (вкладка «Чат»), **всегда с упоминанием @Иван Сысоев**; ответы приходят позже, пока
работать дальше. Сообщения в чате не начинать с `>>>` (бот исполняет такие как JavaScript).
Если в задаче остались решения, принятые без согласования, — перечислить их в описании и спросить в чате.
