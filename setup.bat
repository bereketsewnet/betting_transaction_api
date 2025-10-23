@echo off
REM Betting Payment Manager API Setup Script for Windows

echo 🚀 Setting up Betting Payment Manager API...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please edit it with your database credentials.
) else (
    echo ✅ .env file already exists
)

echo 🔍 Checking database connection...
echo Please make sure MySQL is running and create the database:
echo CREATE DATABASE betting_payment_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

echo.
echo 🎉 Setup complete! Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Create MySQL database: betting_payment_manager
echo 3. Run: npm run setup (to run migrations and seeds)
echo 4. Run: npm run dev (to start development server)
echo.
echo 📚 API will be available at: http://localhost:3000/api/v1
echo 🔍 Health check: http://localhost:3000/health
echo.
echo 🔑 Default credentials:
echo    Admin: admin@example.com / AdminPass123!
echo    Agent: agent@example.com / AgentPass123!
pause
