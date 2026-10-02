"""Browsing and deleting the current user's saved runs."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user
from app.schemas.history import DeleteResponse, SessionListResponse, SessionSummary
from app.services import history_service
from app.services.codebot_service import to_object_id

logger = logging.getLogger("codebot.history_routes")

router = APIRouter(prefix="/history", tags=["history"])

NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Session not found",
)


def _to_summary(document: dict) -> SessionSummary:
    """Turn a stored document into the shape the History page expects."""
    return SessionSummary(
        id=str(document["_id"]),
        operation=document["operation"],
        language=document["language"],
        target_language=document.get("target_language"),
        source_code=document["source_code"],
        input_prompt=document.get("input_prompt", ""),
        result=document.get("result", {}),
        status=document.get("status", "success"),
        duration_seconds=document.get("duration_seconds"),
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


@router.get(
    "",
    response_model=SessionListResponse,
    summary="List the current user's sessions",
)
async def list_history(
    operation: str | None = Query(default=None, max_length=40),
    language: str | None = Query(default=None, max_length=40),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
) -> SessionListResponse:
    documents, total = await history_service.list_sessions(
        user_id=str(current_user["_id"]),
        operation=operation,
        language=language,
        page=page,
        limit=limit,
    )

    return SessionListResponse(
        sessions=[_to_summary(document) for document in documents],
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{session_id}",
    response_model=SessionSummary,
    summary="Return one session",
)
async def read_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
) -> SessionSummary:
    try:
        object_id = to_object_id(session_id)
    except ValueError as error:
        raise NOT_FOUND from error

    document = await history_service.get_session(str(current_user["_id"]), object_id)

    if document is None:
        raise NOT_FOUND

    return _to_summary(document)


@router.delete(
    "/{session_id}",
    response_model=DeleteResponse,
    summary="Delete one session",
)
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
) -> DeleteResponse:
    try:
        object_id = to_object_id(session_id)
    except ValueError as error:
        raise NOT_FOUND from error

    deleted = await history_service.delete_session(
        str(current_user["_id"]), object_id
    )

    if not deleted:
        raise NOT_FOUND

    return DeleteResponse(message="Session deleted", id=session_id)