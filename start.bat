@echo off
echo ===========================================
echo    Запуск проекта Детский центр Лучик
echo ===========================================
echo.

echo [1/2] Запуск Django backend...
cd backend
start cmd /k "python manage.py runserver"
cd ..

echo [2/2] Запуск Next.js frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo ===========================================
echo    Проект успешно запущен!
echo ===========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Для остановки закройте открытые окна терминала
echo.
pause

