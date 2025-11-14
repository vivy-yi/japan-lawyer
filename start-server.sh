#!/bin/bash

echo "🚀 Starting local HTTP server for navigation system..."

# 检查是否有Python 3
if command -v python3 &> /dev/null; then
    echo "✅ Python3 found, starting server..."
    echo "📡 Server will be available at: http://localhost:8000"
    echo "🌐 Open your browser and navigate to the frontend directory"
    echo "⚠️  Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python found, starting server..."
    echo "📡 Server will be available at: http://localhost:8000"
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "✅ Node.js found, checking for serve package..."
    if npm list -g serve &> /dev/null; then
        echo "📡 Starting serve on port 8000..."
        npx serve . --port 8000
    else
        echo "❌ Please install serve: npm install -g serve"
    fi
elif command -v php &> /dev/null; then
    echo "✅ PHP found, starting server..."
    php -S localhost:8000
else
    echo "❌ No suitable server found. Please install one of the following:"
    echo "   - Python 3: https://www.python.org/"
    echo "   - Node.js: https://nodejs.org/"
    echo "   - PHP: https://www.php.net/"
    echo ""
    echo "Then run this script again."
    exit 1
fi