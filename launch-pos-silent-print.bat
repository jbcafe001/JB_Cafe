@echo off
title JB Cafe POS - Silent Thermal Printing Launcher
echo =========================================================
echo       JB PAVILION & CAFE - SILENT THERMAL PRINT
echo =========================================================
echo.
echo NOTE: Make sure your 80mm Thermal Printer is set as
echo your Windows Default Printer (Settings ^> Printers).
echo.

set TARGET_URL=https://jb-cafe.vercel.app/

echo Launching POS (%TARGET_URL%) with silent thermal printing enabled...
echo (Print dialogs will be completely bypassed!)
echo.

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=%TARGET_URL%
    exit
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=%TARGET_URL%
    exit
)

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=%TARGET_URL%
    exit
)

echo Chrome could not be located in standard program paths.
echo Please start Chrome manually with the flag:
echo   chrome.exe --kiosk-printing --app=%TARGET_URL%
pause
