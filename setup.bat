@echo off
echo Setting up environment files...

REM Create backend .env if missing
if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env"
    echo Backend .env created!
) else (
    echo Backend .env already exists.
)

REM Create frontend .env if missing
if not exist "frontend\.env" (
    echo Creating frontend\.env from template...
    copy "frontend\.env.example" "frontend\.env"
    echo Frontend .env created!
) else (
    echo Frontend .env already exists.
)

echo.
echo Setup complete!
echo.
echo IMPORTANT: Edit the .env files with your real API keys:
echo   - backend\.env  (DATABASE_URL, COHERE_API_KEY, GROQ_API_KEY)
echo   - frontend\.env (COHERE_API_KEY)
echo.
pause
