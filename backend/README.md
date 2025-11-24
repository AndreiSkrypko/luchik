# Backend - Детский центр Лучик

Django REST API для детского центра "Лучик"

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Скопируйте и заполните переменные окружения (PostgreSQL):
```bash
cp env.example .env
```
Обязательно укажите `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`.  
Для локального запуска удобно поднять Postgres через Docker:
```bash
docker run --name luchik-db -e POSTGRES_DB=luchik -e POSTGRES_USER=luchik -e POSTGRES_PASSWORD=luchik -p 5432:5432 -d postgres:15-alpine
```

5. Примените миграции:
```bash
python manage.py migrate
```

6. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

7. Запустите сервер:
```bash
python manage.py runserver
```

> **Примечание:** Если ранее использовалась SQLite (`db.sqlite3`), выполните миграцию данных в Postgres (например, через `python manage.py dumpdata > data.json` / `loaddata`). Django теперь ожидает Postgres в соответствии с `DATABASES` из `settings.py`.

## API Endpoints

- `GET /api/home/` - данные главной страницы
- `GET /api/courses/` - список курсов
- `GET /api/contacts/` - контактная информация
- `/admin/` - административная панель

