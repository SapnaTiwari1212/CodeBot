"""MongoDB connection handling.

PyMongo's async client is created lazily and reused for the life of the process.
A single client is important: each one owns its own connection pool, so creating
one per request would exhaust the Atlas connection limit.

The connection is not established at import time. That keeps the app importable
for tests and lets the server start even while the database is briefly
unreachable, which is what makes the health endpoint meaningful on boot.
"""

import logging

from pymongo import ASCENDING, DESCENDING, AsyncMongoClient
from pymongo.errors import PyMongoError

from app.core.config import settings

logger = logging.getLogger("codebot.database")

_client: AsyncMongoClient | None = None

USERS_COLLECTION = "users"
CODE_SESSIONS_COLLECTION = "code_sessions"


def get_client() -> AsyncMongoClient:
    """Return the shared client, creating it on first use."""
    global _client

    if _client is None:
        _client = AsyncMongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            uuidRepresentation="standard",
        )

    return _client


def get_database():
    """Return the configured database handle."""
    return get_client()[settings.DATABASE_NAME]


def get_users_collection():
    return get_database()[USERS_COLLECTION]


def get_code_sessions_collection():
    return get_database()[CODE_SESSIONS_COLLECTION]


async def connect_to_database() -> None:
    """Verify the connection and create indexes.

    Indexes matter here:
      * users.email is unique, which makes a duplicate registration fail at the
        database level instead of relying on a check-then-insert race.
      * code_sessions.(user_id, created_at) makes "my history, newest first" an
        efficient query instead of a collection scan.
    """
    try:
        client = get_client()
        await client.admin.command("ping")

        users = get_users_collection()
        await users.create_index("email", unique=True, name="users_email_unique")

        sessions = get_code_sessions_collection()
        await sessions.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="code_sessions_user_created",
        )
        await sessions.create_index(
            [("user_id", ASCENDING), ("operation", ASCENDING)],
            name="code_sessions_user_operation",
        )
        await sessions.create_index(
            [("user_id", ASCENDING), ("language", ASCENDING)],
            name="code_sessions_user_language",
        )

        logger.info("Connected to MongoDB database %s", settings.DATABASE_NAME)
    except PyMongoError as error:
        # Logged without the URI: connection strings contain credentials.
        logger.error("Could not connect to MongoDB: %s", type(error).__name__)


async def close_database() -> None:
    global _client

    if _client is not None:
        _client.close()
        _client = None