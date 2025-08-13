@echo off
echo Setting up Reports with Sample Data...
echo.

cd backend

echo Initializing database...
node init-db.js

echo.
echo Seeding sample data...
node seed-test-data.js

echo.
echo Setting up reports data...
node seed-reports-data.js

echo.
echo Reports setup complete!
echo You can now access:
echo - Student Reports: http://localhost:8080/student/reports
echo - Admin Reports: http://localhost:8080/admin/reports
echo.
pause