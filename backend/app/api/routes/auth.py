"""Registration, login and the current user.

Security notes that are visible in this file on purpose:

* The login message is identical for an unknown email and a wrong password.
  Anything more specific tells an attacker which addresses are registered.
* Verification runs even when the account does not exist, using a precomputed
  dummy hash. Skipping it would make failed logins far slower than successful
  ones, which leaks the same fact through response time.
* A registration conflict is a 409, not a 500, and the unique index in
  `core/database.py` is what actually prevents the duplicate.
"""
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.api.dependencies import get_current_user, to_user_response
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.user import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import user_service

logger = logging.getLogger("codebot.auth")

router = APIRouter(prefix="/auth", tags=["auth"])

INVALID_LOGIN = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect email or password",
    headers={"WWW-Authenticate": "Bearer"},
)

# A real bcrypt hash of a value nobody will submit. Comparing against it costs
# the same as comparing against a real account's hash.
_DUMMY_HASH = hash_password("codebot-timing-equalizer")


def _token_for(user: dict) -> TokenResponse:
    access_token = create_access_token(
        subject=str(user["_id"]),
        expires_delta=timedelta(minutes=60),
    )

    return TokenResponse(access_token=access_token, user=to_user_response(user))


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an account and return a token",
)
async def register(payload: RegisterRequest) -> TokenResponse:
    existing = await user_service.find_user_by_email(payload.email)

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    try:
        user = await user_service.create_user(payload.name, payload.email, payload.password)
    except DuplicateKeyError:
        # Two registrations for the same email can both pass the check above.
        # The unique index catches the loser, so the answer is still a clean 409.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    return _token_for(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Exchange credentials for a token",
)
async def login(payload: LoginRequest) -> TokenResponse:
    user = await user_service.find_user_by_email(payload.email)

    if user is None:
        verify_password(payload.password, _DUMMY_HASH)
        raise INVALID_LOGIN

    if not verify_password(payload.password, user["password_hash"]):
        raise INVALID_LOGIN

    return _token_for(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return the account behind the current token",
)
async def read_current_user(current_user: dict = Depends(get_current_user)) -> UserResponse:
    return to_user_response(current_user)