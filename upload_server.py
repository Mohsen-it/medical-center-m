import http.server
import socketserver
import os
import json
from urllib.parse import parse_qs

PORT = 8080
os.chdir('/home/z/my-project')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/download':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html = '''
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحميل مشروع المجمع الطبي</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
        h1 { color: #333; margin-bottom: 20px; }
        .download-btn { background: linear-gradient(45deg, #0ea5e9, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; margin: 20px 0; font-weight: bold; transition: transform 0.3s; }
        .download-btn:hover { transform: translateY(-2px); }
        .info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .file-info { color: #666; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 مشروع إدارة المجمع الطبي</h1>
        <div class="info">
            <p><strong>حجم الملف:</strong> 26.9 KB</p>
            <p><strong>الصيغة:</strong> tar.gz</p>
            <p><strong>المحتوى:</strong> مشروع Laravel + React كامل</p>
        </div>
        <a href="/medical-center.tar.gz" class="download-btn">📥 تحميل المشروع</a>
        <div class="file-info">
            <p>بعد التحميل، اقرأ ملف README.md للتعليمات</p>
            <p>بيانات الدخول الافتراضية: admin@medical.com / password</p>
        </div>
    </div>
</body>
</html>
            '''
            self.wfile.write(html.encode('utf-8'))
        else:
            super().do_GET()

with socketserver.TCPServer(('', PORT), MyHTTPRequestHandler) as httpd:
    print(f'Server running at http://localhost:{PORT}')
    print(f'Download page: http://localhost:{PORT}/download')
    httpd.serve_forever()
