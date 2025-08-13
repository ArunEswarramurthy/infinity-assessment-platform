@echo off
echo ========================================
echo   MCQ Test Platform - Fix and Start
echo ========================================
echo.

echo [1/3] Killing any existing Node processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im nodemon.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Starting backend server...
cd backend
start "MCQ Backend" cmd /k "echo Backend Server Starting... && npm run dev"

echo [3/3] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Server should be starting now!
echo.
echo 🌐 Application URLs:
echo    Backend API: http://localhost:5000
echo    Health Check: http://localhost:5000/api/health
echo.
echo 📋 Admin Report Endpoints:
echo    GET /api/admin/test-reports - List all tests with report status
echo    GET /api/admin/test-reports/:testId/download - Download reports
echo    GET /api/admin/dashboard - Admin dashboard
echo.
echo 🔧 If you see "port in use" error:
echo    1. Close all Node/cmd windows
echo    2. Run this script again
echo.
pause