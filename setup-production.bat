@echo off
echo ========================================
echo   MCQ Test Platform - Production Setup
echo ========================================
echo.

echo [1/6] Installing backend dependencies...
cd backend
call npm install --production
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [2/6] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [3/6] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo [4/6] Setting up database...
cd ..\backend
call node init-db.js
if %errorlevel% neq 0 (
    echo ❌ Database initialization failed
    pause
    exit /b 1
)

echo.
echo [5/6] Seeding sample data...
call node seed-test-data.js
if %errorlevel% neq 0 (
    echo ❌ Data seeding failed
    pause
    exit /b 1
)

echo.
echo [6/6] Creating logs directory...
if not exist "logs" mkdir logs

echo.
echo ✅ Production setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env file with production values
echo 2. Configure SSL certificates for HTTPS
echo 3. Set up reverse proxy (nginx/Apache)
echo 4. Configure database backups
echo 5. Set up monitoring and logging
echo.
echo 🚀 To start in production mode:
echo    npm start
echo.
pause