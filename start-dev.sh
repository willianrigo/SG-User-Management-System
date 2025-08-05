#!/bin/bash

# Development startup script for User Management System

echo "Starting User Management System Development Environment"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    echo "   (the directory containing both 'backend' and 'frontend' folders)"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists firebase; then
    echo "Error: Firebase CLI not found. Please install it with: npm install -g firebase-tools"
    exit 1
fi

if ! command_exists npm; then
    echo "Error: npm not found. Please install Node.js and npm"
    exit 1
fi

echo "Prerequisites check passed"
echo ""

# Setup and build backend TypeScript functions
echo "Setting up backend functions..."
cd backend/functions

if [ ! -f "package.json" ]; then
    echo "Error: backend/functions/package.json not found"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install backend dependencies"
        exit 1
    fi
fi

# Compile TypeScript
echo "Compiling TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: TypeScript compilation failed"
    echo "Make sure your TypeScript code in backend/functions/src/ is valid"
    exit 1
fi

echo "Backend build successful"

# Start Firebase emulators in the background
echo "Starting Firebase emulators..."
cd ..
firebase emulators:start --only auth,database,functions,ui &
FIREBASE_PID=$!

# Wait for emulators to start
echo "Waiting for emulators to initialize..."
sleep 10

# Setup and start frontend development server
echo "Setting up frontend..."
cd ../frontend

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install frontend dependencies"
        exit 1
    fi
fi

echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Development environment started!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Firebase Emulator UI: http://localhost:4000"
echo "Database Emulator: http://localhost:9000"
echo "Functions Emulator: http://localhost:5001"
echo "Auth Emulator: http://localhost:9099"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo 'Stopping development environment...'; kill $FIREBASE_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait