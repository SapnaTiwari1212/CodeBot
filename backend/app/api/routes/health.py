"""Liveness endpoint.

This route deliberately touches no database and no AI provider, so it answers as
long as the process itself is healthy. A deployment platform can use it to decide
whether to send traffic here.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app import __version__
from app.core.config import settings

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    """Shape of the response returned by GET /api/health."""

    status: str
    service: str
    version: str
    environment: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check that the API is running",
)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        version=__version__,
        environment=settings.ENVIRONMENT,
    )