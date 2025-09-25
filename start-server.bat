@echo off
echo Starting InsightPilot Development Server...
echo.
echo The server will start on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
npx http-server -p 8080 -c-1
pause
