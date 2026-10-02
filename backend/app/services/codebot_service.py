"""The orchestration layer: prompt selection, AI call, validation, persistence.

A route should stay thin, so the order of operations lives here:

1. Pick the prompt module for the requested operation.
2. Call OpenAI through `ai_service`, which owns the API key.
3. Parse the reply into a validated result dict.
4. Save the run to `code_sessions`.

Step 4 runs whether the run succeeded or failed. A user who hits an error still
needs the attempt in their history, otherwise the History page would silently
hide failed work.
"""
import logging
import time
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.core.database import get_code_sessions_collection
from app.models.code_session import SessionStatus
from app.prompts import (
    chat,
    complexity,
    convert,
    debug,
    explain,
    fix,
    generate,
    improve,
    optimize,
    refactor,
    review,
)
from app.schemas.codebot import CodeRunRequest
from app.services.ai_service import AiServiceError, complete
from app.utils.response_parser import AiResponseError, parse_result

logger = logging.getLogger("codebot.codebot")

#: Every operation has its own prompt module. Adding an operation means adding a
#: module here, a result model in schemas/codebot.py and an entry in the frontend
#: operation metadata.
PROMPT_MODULES = {
    "explain": explain,
    "fix": fix,
    "debug": debug,
    "improve": improve,
    "refactor": refactor,
    "optimize": optimize,
    "generate": generate,
    "convert": convert,
    "complexity": complexity,
    "review": review,
}


async def run_operation(request: CodeRunRequest) -> tuple[dict, float]:
    """Run one CodeBot operation and return its validated result.

    Raises AiServiceError or AiResponseError, both of which the route converts
    into a 502 with a message the user can act on.
    """
    started = time.perf_counter()

    module = PROMPT_MODULES[request.operation]

    if request.operation == "generate":
        user_prompt = module.build_user_prompt(request.prompt, request.language)
    elif request.operation == "convert":
        user_prompt = module.build_user_prompt(
            request.code,
            request.language,
            request.target_language,
            request.prompt,
        )
    else:
        user_prompt = module.build_user_prompt(
            request.code,
            request.language,
            request.prompt,
        )

    content = await complete(module.SYSTEM_PROMPT, user_prompt)

    result = parse_result(request.operation, content)

    duration = round(time.perf_counter() - started, 3)

    return result, duration


async def run_chat(
    message: str,
    code: str,
    language: str,
    history: list[dict],
) -> str:
    """Answer a question about the code in the editor."""
    conversation = chat.build_conversation(history)

    return await complete(
        chat.build_system_prompt(language),
        chat.build_user_prompt(code, language, message),
        conversation=conversation,
    )


async def save_session(
    user_id: str,
    request: CodeRunRequest,
    result: dict,
    duration: float,
    status: SessionStatus = SessionStatus.SUCCESS,
) -> tuple[str, datetime]:
    """Persist one run and return its id and creation time."""
    now = datetime.now(timezone.utc)

    document = {
        "user_id": user_id,
        "operation": request.operation,
        "language": request.language,
        "target_language": request.target_language,
        "source_code": request.code,
        "input_prompt": request.prompt,
        "result": result,
        "status": status.value,
        "duration_seconds": duration,
        "created_at": now,
        "updated_at": now,
    }

    try:
        inserted = await get_code_sessions_collection().insert_one(document)
    except DuplicateKeyError as error:
        # The schema already guards against an empty id, so this would mean the
        # database is in a state we do not understand. Failing loudly is right.
        logger.error("Duplicate session id while saving: %s", type(error).__name__)
        raise
    except PyMongoError as error:
        logger.error("Could not save session: %s", type(error).__name__)
        raise

    return str(inserted.inserted_id), now


def to_object_id(session_id: str) -> ObjectId:
    """Convert a session id from the URL into an ObjectId.

    Raises ValueError for anything that is not a valid id, which the route turns
    into a 404 rather than letting PyMongo raise an opaque error.
    """
    if not ObjectId.is_valid(session_id):
        raise ValueError("Not a valid session id")

    return ObjectId(session_id)


__all__ = [
    "AiResponseError",
    "AiServiceError",
    "SessionStatus",
    "run_chat",
    "run_operation",
    "save_session",
    "to_object_id",
]