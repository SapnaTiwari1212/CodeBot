"""Reading and deleting saved sessions.

Every query in this module filters on `user_id`. That is the whole ownership
model: a session is only ever reachable through the user who created it, so a
guessed id from another account returns 404 rather than another user's code.
"""
import logging

from pymongo.errors import PyMongoError

from app.core.database import get_code_sessions_collection

logger = logging.getLogger("codebot.history")

SORT_NEWEST_FIRST = -1


async def list_sessions(
    user_id: str,
    operation: str | None = None,
    language: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[dict], int]:
    """Return one page of a user's sessions plus the total match count."""
    query: dict = {"user_id": user_id}

    if operation:
        query["operation"] = operation

    if language:
        query["language"] = language

    collection = get_code_sessions_collection()

    try:
        total = await collection.count_documents(query)
        cursor = (
            collection.find(query)
            .sort("created_at", SORT_NEWEST_FIRST)
            .skip((page - 1) * limit)
            .limit(limit)
        )
        sessions = [document async for document in cursor]
    except PyMongoError as error:
        logger.error("Could not list sessions: %s", type(error).__name__)
        raise

    return sessions, total


async def get_session(user_id: str, session_id) -> dict | None:
    """Return one session if it belongs to the user, otherwise None."""
    return await get_code_sessions_collection().find_one(
        {"_id": session_id, "user_id": user_id}
    )


async def delete_session(user_id: str, session_id) -> bool:
    """Delete one session if it belongs to the user.

    Returns False when nothing was deleted, which covers both "no such session"
    and "that session belongs to someone else".
    """
    result = await get_code_sessions_collection().delete_one(
        {"_id": session_id, "user_id": user_id}
    )

    return result.deleted_count == 1


async def count_sessions(user_id: str) -> int:
    """Total sessions for a user, used for the dashboard stats."""
    return await get_code_sessions_collection().count_documents({"user_id": user_id})


async def list_recent_operations(user_id: str, limit: int = 5) -> list[str]:
    """The operations a user has run most recently, newest first."""
    cursor = (
        get_code_sessions_collection()
        .find({"user_id": user_id}, {"operation": 1})
        .sort("created_at", SORT_NEWEST_FIRST)
        .limit(limit)
    )

    return [document["operation"] async for document in cursor]