"""Shared FastAPI dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import InvalidTokenError, decode_access_token
from app.schemas.user import UserResponse
from app.services import user_service

# auto_error=False so a missing header produces our own 401 shape instead of
# FastAPI's default body.
bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Resolve the user behind the bearer token.

    Three checks, all of which fail the same way on purpose:
      1. a bearer token is present,
      2. it is signed by us and not expired,
      3. the user it names still exists.

    Step 3 matters because a token can outlive the account it was issued for.
    """
    if credentials is None or not credentials.credentials:
        raise CREDENTIALS_ERROR

    try:
        user_id = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise CREDENTIALS_ERROR

    user = await user_service.find_user_by_id(user_id)

    if user is None:
        raise CREDENTIALS_ERROR

    return user


def to_user_response(user: dict) -> UserResponse:
    """Build the public user payload from a stored document."""
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
    )