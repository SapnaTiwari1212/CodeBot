"""Check that the values in backend/.env actually work.

Run from the backend directory:

    .\.venv\Scripts\python.exe -m scripts.check_connections

It verifies, in order:

1. every required setting is present and is not still a placeholder,
2. the JWT secret is long enough to be worth signing with,
3. MongoDB accepts the connection string,
4. OpenAI accepts the key and the configured model.

Nothing is printed that would leak a secret: values are described, never shown.
Exit code is 0 when everything passed and 1 otherwise, so it is usable in a
script.
"""

import asyncio
import sys

from openai import AsyncOpenAI
from pymongo.errors import PyMongoError

from app.core.config import settings
from app.core.database import get_client

OK = "[ OK ]"
FAIL = "[FAIL]"


def _is_placeholder(value: str | None) -> bool:
    if not value:
        return True

    lowered = value.lower()
    return "replace" in lowered or "change-me" in lowered or "<" in lowered


async def check_mongo() -> bool:
    print("\nMongoDB")
    print(f"  database : {settings.DATABASE_NAME}")

    if _is_placeholder(settings.MONGODB_URI):
        print(f"  {FAIL} MONGODB_URI still looks like the example value")
        return False

    try:
        client = get_client()
        await client.admin.command("ping")
        databases = await client.list_database_names()
        print(f"  {OK} connected; {len(databases)} database(s) visible")
        return True
    except PyMongoError as error:
        print(f"  {FAIL} could not connect: {type(error).__name__}")
        print("       common causes: wrong password, user not created,")
        print("       or this machine's IP is not allowed in Network Access")
        return False


async def check_openai() -> bool:
    print("\nOpenAI")
    print(f"  model    : {settings.OPENAI_MODEL}")

    if _is_placeholder(settings.OPENAI_API_KEY.get_secret_value()):
        print(f"  {FAIL} OPENAI_API_KEY still looks like the example value")
        return False

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY.get_secret_value(),
        timeout=30.0,
    )

    try:
        await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": "Reply with the word ok."}],
            max_tokens=2,
        )
        print(f"  {OK} key works and {settings.OPENAI_MODEL} is reachable")
        return True
    except Exception as error:  # noqa: BLE001 - reported, not raised
        print(f"  {FAIL} request failed: {type(error).__name__}")
        print("       common causes: invalid key, no billing set up,")
        print("       or the model name is not available to this account")
        return False


def check_settings() -> bool:
    print("Configuration")

    ok = True

    if _is_placeholder(settings.JWT_SECRET.get_secret_value()):
        print(f"  {FAIL} JWT_SECRET is not set")
        ok = False
    elif len(settings.JWT_SECRET.get_secret_value()) < 32:
        print(f"  {FAIL} JWT_SECRET is shorter than 32 characters")
        ok = False
    else:
        print(f"  {OK} JWT_SECRET is set ({len(settings.JWT_SECRET.get_secret_value())} chars)")

    if "*" in settings.CORS_ORIGINS and settings.ENVIRONMENT.lower() == "production":
        print(f"  {FAIL} CORS_ORIGINS uses '*' while ENVIRONMENT is production")
        ok = False
    else:
        print(f"  {OK} CORS_ORIGINS: {', '.join(settings.CORS_ORIGINS)}")

    return ok


async def main() -> int:
    print("CodeBot connection check")

    settings_ok = check_settings()
    mongo_ok = await check_mongo()
    openai_ok = await check_openai()

    print("\nResult")
    if settings_ok and mongo_ok and openai_ok:
        print(f"  {OK} everything is ready. Start the API with:")
        print("       uvicorn app.main:app --reload")
        return 0

    print(f"  {FAIL} fix the items marked above, then run this check again")
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))