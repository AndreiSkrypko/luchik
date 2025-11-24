# Детский центр «Лучик»

Полноценное приложение для тренажеров: Django backend + Next.js frontend.

## Быстрый старт в Docker

Требования:
- Docker + Docker Compose
- Свободные порты `3000`, `8000`, `5432`

1. Скопируйте `.env` для backend (если еще не сделали):
   ```bash
   cp backend/env.example backend/.env
   ```
   Проверьте, что в `.env` указаны переменные подключения к базе (`POSTGRES_*`), секретный ключ и хосты.

2. Соберите образы и установите зависимости:
   ```bash
   docker compose build
   ```

3. Запустите инфраструктуру:
   ```bash
   docker compose up
   ```

4. Примените миграции и соберите статику (однократно после первого запуска):
   ```bash
   docker compose run --rm backend python manage.py migrate
   docker compose run --rm backend python manage.py collectstatic --noinput
   ```

5. Приложения:
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:3000

Остановить контейнеры:
```bash
docker compose down
```

## Структура репозитория

- `backend/` — Django (REST API, тренажеры, админка)
- `frontend/` — Next.js 14 (интерфейс тренажеров)
- `docker-compose.yml` — оркестрация сервисов (backend, frontend, Postgres)
- `backend/Dockerfile`, `frontend/Dockerfile` — конфигурация образов

Для локальной разработки без Docker используйте инструкцию в `backend/README.md` и `frontend/README.md`.

