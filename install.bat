@echo off
echo ===========================================
echo    Установка проекта Детский центр Лучик
echo ===========================================
echo.

echo [1/4] Создание виртуального окружения Python...
cd backend
python -m venv venv
echo Виртуальное окружение создано!
echo.

echo [2/4] Установка зависимостей Python...
call venv\Scripts\activate
pip install -r requirements.txt
echo Зависимости Python установлены!
echo.

echo [3/4] Применение миграций Django...
python manage.py migrate
echo Миграции применены!
echo.

cd ..

echo [4/4] Установка зависимостей Node.js...
cd frontend
call npm install
echo Зависимости Node.js установлены!
echo.

cd ..

echo.
echo ===========================================
echo    Установка завершена успешно!
echo ===========================================
echo.
echo Для запуска проекта используйте start.bat
echo.
pause

