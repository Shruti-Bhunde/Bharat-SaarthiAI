import os
import sys

# Production configuration for Gunicorn serving Uvicorn workers (Render runtime entrypoint)
# Bind to the PORT environment variable provided by Render, defaults to 8000
port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Worker count configured dynamically
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
