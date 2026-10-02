"""Password hashing and JWT behaviour, tested without a database."""

from datetime import timedelta

import pytest

from app.core.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_is_not_the_password():
    hashed = hash_password("correct horse battery staple")

    assert hashed != "correct horse battery staple"
    assert hashed.startswith("$2")


def test_password_verifies_against_its_hash():
    hashed = hash_password("s3cret-password")

    assert verify_password("s3cret-password", hashed) is True


def test_wrong_password_does_not_verify():
    hashed = hash_password("s3cret-password")

    assert verify_password("not-the-password", hashed) is False


def test_malformed_hash_returns_false_instead_of_raising():
    assert verify_password("anything", "not-a-bcrypt-hash") is False


def test_two_hashes_of_the_same_password_differ():
    """A random salt per hash is what makes this true."""
    assert hash_password("same") != hash_password("same")


def test_token_round_trips_to_the_subject():
    token = create_access_token("user-123")

    assert decode_access_token(token) == "user-123"


def test_token_signed_with_another_secret_is_rejected():
    import jwt

    forged = jwt.encode(
        {"sub": "user-123"},
        "a-different-secret-that-is-long-enough-for-sha256",
        algorithm="HS256",
    )

    with pytest.raises(InvalidTokenError):
        decode_access_token(forged)


def test_expired_token_is_rejected():
    token = create_access_token("user-123", expires_delta=timedelta(seconds=-1))

    with pytest.raises(InvalidTokenError):
        decode_access_token(token)


def test_token_without_subject_is_rejected():
    import jwt

    from app.core.config import settings

    token = jwt.encode(
        {},
        settings.JWT_SECRET.get_secret_value(),
        algorithm=settings.JWT_ALGORITHM,
    )

    with pytest.raises(InvalidTokenError):
        decode_access_token(token)