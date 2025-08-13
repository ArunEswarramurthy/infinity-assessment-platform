@echo off
echo ========================================
echo   MCQ Test Platform - Development Mode
echo ========================================
echo.

echo [1/3] Checking dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
)

cd ..
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
)

cd ..
echo ✅ Dependencies checked

echo.
echo [2/3] Starting Backend Server...
start "MCQ Backend" cmd /k "cd backend && echo Starting backend server... && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Frontend Server...
start "MCQ Frontend" cmd /k "cd frontend && echo Starting frontend server... && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 🌐 Application URLs:
echo    Backend API: http://localhost:5000
echo    Frontend:    http://localhost:8080
echo.
echo 📋 Useful endpoints:
echo    Health Check: http://localhost:5000/api/health
echo    Admin Panel:  http://localhost:8080/admin
echo    Student Login: http://localhost:8080/login
echo.
echo 🔧 To stop servers: Close the terminal windows
echo.
pause