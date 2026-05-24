# Фронтенд ВКР-платформы

## Запуск

```bash
cd frontend
npm install
npm run dev
```

В терминале появится строка вида:

```text
➜  Local:   http://localhost:5173/
```

**Открывайте именно этот адрес** (с портом `:5173`).

## Частая ошибка: «Not Found»

| Адрес | Что будет |
|-------|-----------|
| `http://localhost` | Это **nginx (бэкенд)**, не сайт. Текст «Infrastructure is up» или путаница с 404 |
| `http://localhost:5173` | **Правильно** — React-приложение |
| `http://localhost:5174` | Только если Vite написал, что 5173 занят — смотрите вывод в терминале |

Бэкенд (Docker) и фронт (Vite) работают **одновременно** на разных портах.

## Письма с кодами

Все письма идут через **email-service** (настройка SMTP только в `infra/.env`).

| Сценарий | Кто отправляет | Подсказка на экране |
|----------|----------------|---------------------|
| Вход | auth-service | `debug_code` на `/verify` |
| Выбор темы | topic-service | код на `/confirm-application` |

Без `SMTP_*` письма печатаются в логах:

```bash
cd infra && docker compose logs -f email-service
```

## Страницы

- http://localhost:5173/login — вход
- http://localhost:5173/register — регистрация
- http://localhost:5173/topics — список тем
- http://localhost:5173/export — выгрузка утверждённых заявок (роль **admin**)
