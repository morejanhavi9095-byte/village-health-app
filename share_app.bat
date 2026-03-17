@echo off
echo 1. Make sure your app is ALREADY running (double-click start_app.bat first).
echo 2. This will give you a public link for your phone.
echo 3. If it asks for a "password", enter your Public IP address.
echo --------------------------------------------------
echo Your Public IP is:
curl ifconfig.me
echo.
echo --------------------------------------------------
echo Starting tunnel...
npx localtunnel --port 3000
pause
