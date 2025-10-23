#!/bin/bash

# Betting Payment Manager API Setup Script

echo "🚀 Setting up Betting Payment Manager API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Check if MySQL is running (optional)
echo "🔍 Checking database connection..."
echo "Please make sure MySQL is running and create the database:"
echo "CREATE DATABASE betting_payment_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create MySQL database: betting_payment_manager"
echo "3. Run: npm run setup (to run migrations and seeds)"
echo "4. Run: npm run dev (to start development server)"
echo ""
echo "📚 API will be available at: http://localhost:3000/api/v1"
echo "🔍 Health check: http://localhost:3000/health"
echo ""
echo "🔑 Default credentials:"
echo "   Admin: admin@example.com / AdminPass123!"
echo "   Agent: agent@example.com / AgentPass123!"
