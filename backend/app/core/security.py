"""Password hashing and JWT handling.

Two rules shape this module:

1. Passwords are hashed with bcrypt, which is deliberately slow. A hash is
   stored, never the password, and `verify_password` compares in constant time
   inside bcrypt itself, so there is no `==` on secrets anywhere.

2. JWTs are signed with a secret that only exists in the backend environment.
   The token carries the user id and an expiry, nothing sensitive.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.core.config import settings


class InvalidTokenError(Exception):
    """Raised when a token is missing, malformed, expired or unsigned wrong."""


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password with a fresh random salt."""
    salt = bcrypt.gensalt()

    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Check a password against its hash. Returns False instead of raising."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except (ValueError, TypeError):
        # A malformed hash in the database must not turn into a 500 for the user.
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT identifying the given user."""
    now = datetime.now(timezone.utc)
    expires_at = now + (
        expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    )

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET.get_secret_value(),
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> str:
    """Return the user id from a token, or raise InvalidTokenError.

    Every failure mode collapses into one exception on purpose: the caller
    answers all of them with the same 401, so a client cannot use the error to
    learn whether a token merely expired or was never valid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError as error:
        raise InvalidTokenError("Token is invalid or expired") from error

    subject = payload.get("sub")

    if not subject:
        raise InvalidTokenError("Token is missing a subject")

    return str(subject)