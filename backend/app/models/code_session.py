"""Shape of the documents stored in the `code_sessions` collection."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SessionStatus(str, Enum):
    """Outcome of a run, stored so history can show what happened."""

    SUCCESS = "success"
    ERROR = "error"


class CodeSessionDocument(BaseModel):
    """A saved CodeBot run, always owned by exactly one user."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    user_id: str
    operation: str
    language: str
    target_language: str | None = None
    source_code: str
    input_prompt: str = ""
    result: dict[str, Any] = Field(default_factory=dict)
    status: SessionStatus = SessionStatus.SUCCESS
    duration_seconds: float | None = None
    created_at: datetime
    updated_at: datetime