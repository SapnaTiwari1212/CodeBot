"""Account information and statistics."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, to_user_response
from app.schemas.user import UserResponse
from app.services import history_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse, summary="Return the current user")
async def read_me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    return to_user_response(current_user)


@router.get("/me/stats", summary="Summary counts for the dashboard")
async def read_my_stats(current_user: dict = Depends(get_current_user)) -> dict:
    """Counts derived from the user's own sessions."""
    user_id = str(current_user["_id"])

    total = await history_service.count_sessions(user_id)
    recent_operations = await history_service.list_recent_operations(user_id)

    return {
        "total_sessions": total,
        "recent_operations": recent_operations,
    }