@echo off
title JB Cafe - RETSOL RTP-82UW Wi-Fi Printer Bridge
echo ===============================================================
echo     JB PAVILION ^& CAFE - RETSOL RTP-82UW WI-FI PRINTER BRIDGE
echo ===============================================================
echo.
echo Connecting to RETSOL 3" Thermal Printer over Wi-Fi (Port 9100)...
echo HTTP Bridge listening on port 8080 for POS ^& Waiter Mobiles.
echo.
echo Press Ctrl+C anytime to stop.
echo.

node wifi-printer-bridge\wifi-printer-bridge.js
pause
