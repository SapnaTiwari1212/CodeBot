"""Schemas for the history endpoints."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.codebot import LanguageId, OperationId


class SessionSummary(BaseModel):
    """A session as listed on the History page.

    `source_code` is included so the page can render a preview without a
    second request per row. It is scoped to the owner, so this is not a leak.
    """

    id: str
    operation: OperationId
    language: LanguageId
    target_language: LanguageId | None = None
    source_code: str
    input_prompt: str
    result: dict
    status: str
    duration_seconds: float | None = None
    created_at: datetime
    updated_at: datetime


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]
    total: int
    page: int = Field(ge=1)
    limit: int = Field(ge=1)


class DeleteResponse(BaseModel):
    message: str
    id: str