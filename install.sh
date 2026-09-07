#!/bin/bash

# PADDOCK F1 Hub - Installation Check for macOS/Linux

echo "========================================================"
echo "       🏎️  PADDOCK F1 Hub - Installation Check"
echo "========================================================"
echo ""

echo "Checking system requirements..."
echo ""

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[X] Node.js is NOT installed"
    echo ""
    echo "Please download and install Node.js from:"
    echo "https://nodejs.org/"
    echo ""
    echo "After installation, run this script again."
    echo ""
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "[OK] Node.js is installed (version: $NODE_VERSION)"
fi

echo ""
echo "[2/4] Checking file structure..."
if [ -f "server.js" ]; then
    echo "[OK] server.js found"
else
    echo "[X] server.js NOT found"
    echo "Please ensure all files are in the correct directory."
    exit 1
fi

if [ -f "paddock/index.html" ]; then
    echo "[OK] paddock/index.html found"
else
    echo "[X] paddock/index.html NOT found"
    echo "Please ensure all files are in the correct directory."
    exit 1
fi

echo ""
echo "[3/4] Checking port availability..."
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[WARNING] Port 8888 is already in use"
    echo "You may need to change the port or stop the conflicting service."
else
    echo "[OK] Port 8888 is available"
fi

echo ""
echo "[4/4] Creating necessary directories..."
mkdir -p paddock/css
mkdir -p paddock/js
echo "[OK] Directory structure verified"

echo ""
echo "========================================================"
echo "           Installation Check Complete!"
echo "========================================================"
echo ""
echo "All requirements are met. You can now start the server:"
echo ""
echo "  - Run: ./start_server.sh"
echo "  - Or: node server.js"
echo ""
echo "Server will be available at: http://localhost:8888"
echo ""
