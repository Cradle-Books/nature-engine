"""Run the actual Django application against an isolated local SQLite fixture DB.

Only email delivery is captured locally; no credentials, real accounts, or real
backend database are used. The mailbox/debug endpoints exist ONLY in this runner.
Run from the repository root with .venv/Scripts/python.exe frontend_1/scripts/integration_backend.py.
"""
import json
import os
from pathlib import Path
import sys
import types
import uuid
from wsgiref.simple_server import make_server, WSGIRequestHandler

PROJECT = Path(__file__).resolve().parents[2]
BACKEND = PROJECT / "backend"
PREVIEW = PROJECT / "frontend_1" / ".preview"
PREVIEW.mkdir(exist_ok=True)
sys.path.insert(0, str(BACKEND))
os.environ["DJANGO_SETTINGS_MODULE"] = "Azaniah.settings"

from django.conf import settings

settings.DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": str(PREVIEW / f"integration-{uuid.uuid4().hex}.sqlite3")}}
settings.SECRET_KEY = "local-integration-only-not-a-production-secret"
settings.DEBUG = False
settings.ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
settings.CORS_ALLOWED_ORIGINS = ["http://localhost:3103", "http://127.0.0.1:3103"]
settings.CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "cradle-integration"}}

mailbox = {}
mail = types.ModuleType("gmail_utils")
def capture_email(email, otp):
    mailbox[email] = otp
    return True
mail.send_otp_email = capture_email
sys.modules["gmail_utils"] = mail

import django
django.setup()
from django.core.management import call_command
from django.contrib.auth.models import User
from django.core.wsgi import get_wsgi_application
from rest_framework_simplejwt.tokens import RefreshToken
from Azaniah.authentication.models import Account, Profile
from Azaniah.books.models import Book, UserBook

call_command("migrate", verbosity=0, interactive=False)
for name in ("reader", "empty"):
    account = Account.objects.create(Email=f"{name}@example.test", Username=name, Password="test-password-123", Confirm_Password="test-password-123")
    Profile.objects.create(account=account, Username=name)
    User.objects.create_user(username=name, email=account.Email, password="test-password-123")
for index in range(1, 10):
    Book.objects.create(title=f"Reading Together {index}", author="Cradle Test Author", external_id=f"/works/test{index}", description="A local integration fixture about books and friendship.", genre=["Fiction"], page_count=320, release_date=2024, average_rating=4.2)
reader = User.objects.get(username="reader")
for index, status in enumerate(("reading", "finished", "want"), start=1):
    UserBook.objects.create(user=reader, book_id=index, status=status)

app = get_wsgi_application()
test_mode = "normal"
request_counts = {}
def application(environ, start_response):
    global test_mode
    path = environ["PATH_INFO"]
    request_counts[path] = request_counts.get(path, 0) + 1
    # Test-only controls are local to this runner and are never Django URL routes.
    if path.startswith("/__integration__/"):
        if path == "/__integration__/mailbox":
            data = mailbox
        elif path == "/__integration__/expired-session":
            from datetime import timedelta
            refresh = RefreshToken.for_user(reader)
            access = refresh.access_token
            access.set_exp(lifetime=timedelta(seconds=-60))
            data = {"access": str(access), "refresh": str(refresh), "username": "reader"}
        elif path == "/__integration__/metrics":
            data = request_counts
        elif path == "/__integration__/control":
            from urllib.parse import parse_qs
            test_mode = parse_qs(environ.get("QUERY_STRING", "")).get("mode", ["normal"])[0]
            data = {"mode": test_mode}
        else:
            start_response("404 Not Found", [("Content-Type", "application/json")])
            return [b'{}']
        start_response("200 OK", [("Content-Type", "application/json")])
        return [json.dumps(data).encode()]
    failures = {"profile-error": "/api/books/profile/", "books-error": "/api/books/recommendations/", "landing-error": "/api/books/trending/", "logout-error": "/api/auth/logout/"}
    if failures.get(test_mode) == path and environ["REQUEST_METHOD"] != "OPTIONS":
        headers = [("Content-Type", "text/html")]
        if environ.get("HTTP_ORIGIN") in settings.CORS_ALLOWED_ORIGINS:
            headers.append(("Access-Control-Allow-Origin", environ["HTTP_ORIGIN"]))
        start_response("503 Service Unavailable", headers)
        return [b"<h1>Temporary service failure</h1>"]
    return app(environ, start_response)

class QuietHandler(WSGIRequestHandler):
    def log_message(self, fmt, *args):
        # Never log passwords, request bodies, tokens, or mailbox contents.
        print(fmt % args, flush=True)

print("Isolated Django integration backend listening on http://127.0.0.1:4900", flush=True)
with make_server("127.0.0.1", 4900, application, handler_class=QuietHandler) as server:
    server.serve_forever()
