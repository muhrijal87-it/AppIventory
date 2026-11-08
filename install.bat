@echo off
echo ===================================================
echo Menginstall dependensi proyek CI-Inventaris...
echo ===================================================
call npm.cmd install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Gagal menginstall dependensi! Mencoba dengan flag legacy-peer-deps...
    call npm.cmd install --legacy-peer-deps
)
echo.
echo Selesai! Anda sekarang dapat menjalankan: run.bat atau npm.cmd run dev
pause
