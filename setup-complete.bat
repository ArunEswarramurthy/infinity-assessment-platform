@echo off
echo ========================================
echo   MCQ Test Platform - Complete Setup
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [2/5] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [3/5] Setting up database...
cd ..\backend
call node init-db.js
if %errorlevel% neq 0 (
    echo ❌ Database initialization failed
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding sample data...
call node seed-test-data.js
if %errorlevel% neq 0 (
    echo ❌ Data seeding failed
    pause
    exit /b 1
)

echo.
echo [5/5] Generating sample reports...
call node seed-reports-data.js
if %errorlevel% neq 0 (
    echo ❌ Reports generation failed
    pause
    exit /b 1
)

echo.
echo ✅ Complete setup finished successfully!
echo.
echo 📋 What's been set up:
echo    - Backend with all dependencies
echo    - Frontend with all dependencies  
echo    - Database with tables and relationships
echo    - Sample users (admin, students, licensed users)
echo    - Sample test with 35 MCQ questions
echo    - Completed test sessions with scores
echo    - Auto-generated Excel and CSV reports
echo.
echo 🔐 Default Login Credentials:
echo    Admin: admin@example.com / admin123
echo    Student: john@example.com / password123
echo    Licensed: LU001 / SIN001
echo.
echo 🚀 To start the application:
echo    start-dev.bat
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:8080
echo    Backend:  http://localhost:5000
echo    Health:   http://localhost:5000/api/health
echo.
pause