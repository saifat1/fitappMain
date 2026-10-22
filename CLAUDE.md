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

- Тарифы в `SubscriptionPlan`: «Старт» бесплатно до 3 клиентов, Pro 690 ₽/мес · 5 900 ₽/год до 15 (FIT-59, было 30), Безлимит 1 190 ₽/мес ·
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

## Мобильное приложение (Capacitor, `frontend/android`)

- Та же веб-сборка, упакованная в Android (FIT-68). `appId` — `ru.com.fitapp` (не менять: сторы привязаны к нему).
  Внутри приложения страница открыта с `https://localhost`: API и ссылки идут на `https://fitapp.com.ru`
  (`src/shared/lib/platform.ts`), CORS бэкенда пропускает `https://localhost` и `capacitor://localhost`.
- Android SDK: `%LOCALAPPDATA%\Android\Sdk` (`$env:ANDROID_HOME`), путь — в `android/local.properties` (не в git).
- Сборка: `cd frontend; npm run android:sync` (build + cap sync), затем `cd android; .\gradlew.bat assembleDebug`
  или `bundleRelease assembleRelease`. Для дев-стенда перед sync задать `$env:VITE_API_BASE_URL="https://195-208-61-184.swtest.ru/api"`.
- Ключ подписи релиза — только на машине: `%USERPROFILE%\.fitapp\fitapp-release.jks` + `keystore.properties`.
  Потеря ключа = нельзя обновить приложение в RuStore. Готовые файлы складываются в `builds/` (не в git).
- Перед каждым релизом в стор увеличить `versionCode`/`versionName` в `android/app/build.gradle`.

## Процесс работы с задачами (YouGile)

Доска: https://ru.yougile.com/team/00b1689b8043/Fit-app (вход — под аккаунтом пользователя во встроенном браузере).
Колонки (с 22.10.2026): Планирование → Fix → **В работе** → **Тест дэв** → Готово, ожидает заливки на бой → Тест прод → Готово.
Задачи ставит и проверяет Иван Сысоев.

1. Брать задачи только из «В работе», сверху вниз. Если колонка пуста — ждать, из «Fix»/«Планирования» сами не брать.
2. Проверить актуальность по коду; план не согласовывать — сразу делать. В описании задачи бывают картинки-макеты —
   смотреть их (текстовая выгрузка их не показывает).
3. Код → сборка/линтер → коммит `FIT-<номер>: <что сделано>` → пуш прямо в `main` → **выложить на дев-стенд**
   (см. «Дев-стенд») и проверить старт бэкенда и миграции.
4. В описание задачи **дописать** (исходный текст не трогать) раздел «ЧТО СДЕЛАНО (коммит <hash>)» с бизнес-логикой
   и раздел «ТЕСТ-КЕЙСЫ» для тестировщика в формате «ТК-N. Название / Шаги / Ожидание», с предусловиями
   (в т.ч. какие миграции должны примениться на стенде).
5. Перенести задачу в **«Тест дэв»** (только после выкладки на дев). Проще всего перетащить карточку на доске; через меню:
   ⋮ → Переместить → Указать место назначения → Fit app → Новая доска → колонка. Дальше («Готово, ожидает заливки на бой»,
   «Тест прод», «Готово») задачи двигает тестировщик / Иван, не мы.
6. Коротко отчитаться пользователю в чате и сразу брать следующую задачу, не спрашивая.
7. **Залил на дев → «Тест дэв».** При любой выкладке на дев перенести в «Тест дэв» все задачи, чьи коммиты в неё попали.

## Дев-стенд

https://195-208-61-184.swtest.ru — VPS `fit_app_dev`, вход по SSH-ключу `~/.ssh/fitapp_dev` (пароль не использовать).
Код в `/opt/fitappMain` (checkout `main`), `.env` только на сервере (почта и пуш выключены — в базе копия реальных клиентов).
Выкладка (и на деве, и на бою): `cd /opt/fitappMain && git pull --ff-only && sh deploy/release.sh` — бэкап базы и `.env`
в `/root/fitapp-release-<дата>/`, обновление, пересборка, проверка старта и миграций; там же описан откат.
Бэкап базы — `deploy/backup.sh` по cron в 03:20, дампы в `/var/backups/fitapp` (14 дней).
Бой: https://80-93-63-169.swtest.ru (VPS 80.93.63.169, тоже `/opt/fitappMain`). На бой — только по команде пользователя.

Уточнения — в чат задачи (вкладка «Чат»), **всегда с упоминанием @Иван Сысоев**; ответы приходят позже, пока
работать дальше. Сообщения в чате не начинать с `>>>` (бот исполняет такие как JavaScript).
Если в задаче остались решения, принятые без согласования, — перечислить их в описании и спросить в чате.
