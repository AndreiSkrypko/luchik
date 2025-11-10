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

4. Примените миграции:
```bash
python manage.py migrate
```

5. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

6. Запустите сервер:
```bash
python manage.py runserver
```

## API Endpoints

- `GET /api/home/` - данные главной страницы
- `GET /api/courses/` - список курсов
- `GET /api/contacts/` - контактная информация
- `/admin/` - административная панель

