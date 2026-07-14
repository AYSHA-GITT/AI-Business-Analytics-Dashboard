import os
import threading
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer


def run_celery():
    subprocess.run(["celery", "-A", "app.celery_app", "worker", "--loglevel=info"])


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Celery worker is running")

    def log_message(self, format, *args):
        pass  # suppress noisy default logging for health pings


def run_health_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    server.serve_forever()


if __name__ == "__main__":
    celery_thread = threading.Thread(target=run_celery, daemon=True)
    celery_thread.start()
    run_health_server()