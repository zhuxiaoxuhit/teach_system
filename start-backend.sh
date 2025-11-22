#!/bin/bash

echo "========================================"
echo "  Teaching Management System - Backend"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL not detected"
    echo "macOS: brew install mysql"
    echo "Windows: https://dev.mysql.com/downloads/mysql/"
    echo ""
fi

# Navigate to server directory
cd "$(dirname "$0")/server" || exit

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found"
    echo "Please create .env file and configure database password"
    exit 1
fi

echo "Starting backend server..."
echo "Server URL: http://localhost:8080"
echo "Health check: http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

# Start server
npm run dev
