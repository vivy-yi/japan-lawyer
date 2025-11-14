#!/bin/bash

echo "🚀 Starting simple HTTP server (no TLS)..."

# 简化的Python服务器配置
cat > server.py << 'EOF'
import http.server
import socketserver
import sys

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头避免跨域问题
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')

        # 添加完整的CSP头部支持Google Fonts和本地资源
        csp_header = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://fonts.googleapis.com; "
            "frame-src 'none'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        self.send_header('Content-Security-Policy', csp_header)

        # 添加X-Frame-Options头部 (必须通过HTTP头部发送)
        self.send_header('X-Frame-Options', 'DENY')

        # 添加其他安全头部
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')

        # 避免缓存问题
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')

        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

# 绑定到localhost以避免网络访问
PORT = 8080
HOST = '127.0.0.1'

Handler = MyHTTPRequestHandler

try:
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"✅ Server started on http://{HOST}:{PORT}")
        print("📡 Access the application in your browser")
        print("⚠️  This avoids TLS/HTTPS issues")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n👋 Server stopped")
    sys.exit(0)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
EOF

echo "📡 Starting server on http://127.0.0.1:8080"
echo "⚠️  This avoids TLS/HTTPS security issues"
echo "🌐 Open browser and navigate to: http://127.0.0.1:8080"
echo ""

python3 server.py