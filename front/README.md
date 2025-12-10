1. Create .env in this directory

SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=

2. To up: docker-compose up --build 

3. To shutdown: docker-compose down (-v for clear DB)


TODO:
User profile (High)

Search by event name substring (Medium)
~~Crete fixtures (Medium)~~ ✅ Done

Deleting old images (Low)
Make secure dict for verification codes (Low)

## Фикстуры

При запуске приложения автоматически загружаются тестовые данные:
- 1 администратор (admin@example.com / admin123)
- 9 пользователей (user@example.com / user123)
- 12 различных событий

Для отключения загрузки фикстур установите `LOAD_FIXTURES=false` в `.env` файле.
init