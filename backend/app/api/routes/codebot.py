"""The CodeBot endpoints: run an operation, and chat about the code.

Error handling is where most of the value in this file lives.

* 401 comes from the dependency: no valid token.
* 422 covers everything the schema can check, including "convert needs a target
  language" and "generate needs a description".
* 502 covers a failure at the AI provider, because the request was valid and the
  upstream service was not able to answer it.
* A run that fails at the AI is still saved with status "error", so the attempt
  appears in the user's history instead of vanishing.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.models.code_session import SessionStatus
from app.schemas.codebot import (
    ChatRequest,
    ChatResponse,
    CodeRunRequest,
    CodeRunResponse,
)
from app.services.codebot_service import (
    AiResponseError,
    AiServiceError,
    run_chat,
    run_operation,
    save_session,
)
from app.utils.validators import truncate_chat_history

logger = logging.getLogger("codebot.routes")

router = APIRouter(prefix="/codebot", tags=["codebot"])

INVALID_RULES = HTTPException(
    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
    detail="The request is not valid for this operation",
)


@router.post(
    "/run",
    response_model=CodeRunResponse,
    summary="Run one CodeBot operation",
)
async def run_code(
    payload: CodeRunRequest,
    current_user: dict = Depends(get_current_user),
) -> CodeRunResponse:
    # Cross-field rules live on the schema, but raise a ValueError rather than a
    # pydantic error, so they are checked here to produce a clear 422.
    try:
        payload.validate_operation_rules()
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    user_id = str(current_user["_id"])

    try:
        result, duration = await run_operation(payload)
    except (AiServiceError, AiResponseError) as error:
        logger.warning("CodeBot run failed for %s: %s", payload.operation, error)

        # Save the failed attempt so the user can see what they tried.
        try:
            await save_session(
                user_id=user_id,
                request=payload,
                result={"error": str(error)},
                duration=0.0,
                status=SessionStatus.ERROR,
            )
        except Exception:  # noqa: BLE001 - history must never mask the real error
            logger.exception("Could not save the failed run")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    session_id, created_at = await save_session(
        user_id=user_id,
        request=payload,
        result=result,
        duration=duration,
    )

    return CodeRunResponse(
        id=session_id,
        operation=payload.operation,
        language=payload.language,
        target_language=payload.target_language,
        result=result,
        status=SessionStatus.SUCCESS.value,
        duration_seconds=duration,
        created_at=created_at,
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask a question about the code in the editor",
)
async def chat_about_code(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:
    """Chat is stateless.

    The frontend sends the recent turns back with each message, so there is no
    conversation to store and nothing to clean up. Only the budget of history is
    enforced here, by keeping the newest turns that fit.
    """
    history = truncate_chat_history(
        [message.model_dump() for message in payload.history]
    )

    try:
        reply = await run_chat(
            message=payload.message,
            code=payload.code,
            language=payload.language,
            history=history,
        )
    except AiServiceError as error:
        logger.warning("CodeBot chat failed: %s", error)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    return ChatResponse(reply=reply)