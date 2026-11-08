@echo off
echo ===================================================
echo Menjalankan CI-Inventaris Development Server...
echo ===================================================
echo Server akan berjalan di http://localhost:3000
echo Tekan Ctrl + C untuk menghentikan server.
echo.
call npm.cmd run dev
pause
