Пакет backend-only для первого шага функционала записи клиента к тренеру.

Что входит:
- 2 новые миграции: 010, 011
- новые пакеты: availability, bookingrequest, clienttrainer
- точечные правки существующих файлов:
  - db.changelog-master.yaml
  - SecurityConfig.java
  - TrainingRepository.java
  - TrainerClientRepository.java

Что НЕ входит:
- фронт
- правки профиля / календаря / стилей
- exceptions по датам
- интеграция в меню
