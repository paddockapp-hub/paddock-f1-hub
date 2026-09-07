#!/bin/bash

# PADDOCK F1 Hub - Server Launcher for macOS/Linux

echo "========================================================"
echo "       🏎️  PADDOCK F1 Hub - Server Launcher"
echo "========================================================"
echo ""
echo "Starting PADDOCK F1 Hub server..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[OK] Node.js is installed"
echo ""

# Check if port is already in use
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[WARNING] Port 8888 is already in use"
    echo "You can change the port by setting PORT environment variable:"
    echo "  PORT=3000 ./start_server.sh"
    echo ""
fi

echo "Starting server on port 8888..."
echo "Server will be available at: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================================"
echo ""

# Wait 3 seconds before opening browser
sleep 3

# Try to open browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:8888
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:8888 2>/dev/null || echo "Could not open browser automatically"
fi

# Start server
node server.js

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Server failed to start!"
    echo ""
    exit 1
fi
