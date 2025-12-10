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
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
