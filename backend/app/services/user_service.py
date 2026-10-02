"""User lookups and registration.

Email addresses are normalised to lowercase before storage so that
`Alice@example.com` and `alice@example.com` are one account rather than two
that both exist and both match a login.
"""
import logging
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.core.database import get_users_collection
from app.core.security import hash_password

logger = logging.getLogger("codebot.users")


def normalize_email(email: str) -> str:
    return email.strip().lower()


async def find_user_by_email(email: str) -> dict | None:
    return await get_users_collection().find_one({"email": normalize_email(email)})


async def find_user_by_id(user_id) -> dict | None:
    if not ObjectId.is_valid(str(user_id)):
        return None

    return await get_users_collection().find_one({"_id": ObjectId(str(user_id))})


async def create_user(name: str, email: str, password: str) -> dict:
    """Create a user and return the stored document.

    Raises DuplicateKeyError when the email is already registered. The route
    turns that into a 409, which is the correct answer for a conflict.
    """
    now = datetime.now(timezone.utc)

    document = {
        "name": name.strip(),
        "email": normalize_email(email),
        "password_hash": hash_password(password),
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await get_users_collection().insert_one(document)
    except DuplicateKeyError:
        raise
    except PyMongoError as error:
        logger.error("Could not create user: %s", type(error).__name__)
        raise

    document["_id"] = result.inserted_id

    return document