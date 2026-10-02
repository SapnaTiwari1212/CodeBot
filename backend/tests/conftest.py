"""Shared test plumbing.

These tests run against an in-memory database double instead of a real MongoDB,
so the suite needs no network and no credentials.

The fake implements only the handful of PyMongo async operations the services
use. That keeps it honest: if a service starts relying on a new operation, the
fake raises AttributeError and the failure is obvious.
"""

import os
from datetime import datetime, timezone

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import DuplicateKeyError

# Settings are read at import time, so provide safe values before importing the
# app. setdefault means a real .env, when present, still wins.
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("JWT_SECRET", "test-secret-not-used-outside-tests")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-not-used")
os.environ.setdefault("DATABASE_NAME", "codebot_test")


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeDeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count


class FakeCursor:
    """The subset of AsyncCursor the history service uses."""

    def __init__(self, documents):
        self._documents = list(documents)
        self._iterator = None

    def sort(self, key, direction=-1):
        self._documents.sort(key=lambda doc: doc.get(key), reverse=direction == -1)
        return self

    def skip(self, count):
        self._documents = self._documents[count:]
        return self

    def limit(self, count):
        self._documents = self._documents[:count]
        return self

    def __aiter__(self):
        self._iterator = iter(self._documents)
        return self

    async def __anext__(self):
        try:
            return next(self._iterator)
        except StopIteration:
            raise StopAsyncIteration


class FakeCollection:
    def __init__(self, unique_fields=()):
        self.documents = []
        self.unique_fields = set(unique_fields)

    @staticmethod
    def _matches(document, query):
        return all(document.get(key) == value for key, value in query.items())

    async def create_index(self, *args, **kwargs):
        return "fake-index"

    async def insert_one(self, document):
        stored = dict(document)

        for field in self.unique_fields:
            if any(doc.get(field) == stored.get(field) for doc in self.documents):
                raise DuplicateKeyError(f"duplicate key on {field}")

        stored.setdefault("_id", ObjectId())
        self.documents.append(stored)

        return FakeInsertResult(stored["_id"])

    async def find_one(self, query):
        for document in self.documents:
            if self._matches(document, query):
                return document
        return None

    def find(self, query, projection=None):
        return FakeCursor(
            [document for document in self.documents if self._matches(document, query)]
        )

    async def count_documents(self, query):
        return sum(1 for document in self.documents if self._matches(document, query))

    async def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                del self.documents[index]
                return FakeDeleteResult(1)
        return FakeDeleteResult(0)


class FakeDatabase:
    def __init__(self):
        self.users = FakeCollection(unique_fields=("email",))
        self.sessions = FakeCollection()

    def get_users(self):
        return self.users

    def get_sessions(self):
        return self.sessions


@pytest.fixture
def fake_db():
    return FakeDatabase()


@pytest.fixture
def client(fake_db, monkeypatch):
    """A TestClient wired to the in-memory database.

    Deliberately not used as a context manager: that would run the lifespan and
    try to reach a real MongoDB.
    """
    import app.services.codebot_service as codebot_service
    import app.services.history_service as history_service
    import app.services.user_service as user_service
    from app.main import app

    monkeypatch.setattr(user_service, "get_users_collection", fake_db.get_users)
    monkeypatch.setattr(codebot_service, "get_code_sessions_collection", fake_db.get_sessions)
    monkeypatch.setattr(history_service, "get_code_sessions_collection", fake_db.get_sessions)

    return TestClient(app)


@pytest.fixture
def user(fake_db):
    """A stored user document, inserted directly so tests can own its id."""
    now = datetime.now(timezone.utc)
    document = {
        "_id": ObjectId(),
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "password_hash": "$2b$12$fakehashfakehashfakehashfakehashfakehashfakehashfakehashfakeha",
        "created_at": now,
        "updated_at": now,
    }
    fake_db.users.documents.append(document)

    return document


@pytest.fixture
def auth_client(client, user):
    """A client whose requests are authenticated as `user`."""
    from app.api.dependencies import get_current_user

    client.app.dependency_overrides[get_current_user] = lambda: user

    yield client

    client.app.dependency_overrides.clear()