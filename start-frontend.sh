#!/bin/bash

echo "========================================="
echo "  Teaching Management System - Frontend"
echo "========================================="
echo ""

# Navigate to project directory
cd teacher-system

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting development server..."
echo ""
echo "========================================="
echo "  URL: http://localhost:3000"
echo "  Login: 18701538360"
echo "  Password: 1234567890"
echo "========================================="
echo ""

# Start development server
npm run dev
