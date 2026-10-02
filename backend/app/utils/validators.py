"""Input validation helpers shared by routes and services.

Validation is deliberately split in two places:

* Field level rules (length, supported values) live in the Pydantic schemas,
  because FastAPI then answers with a 422 automatically.
* Rules that span several fields live here or in a schema method, because a
  field validator only ever sees one field.

Nothing in this module touches the database or the network.
"""

from app.core.config import settings

MAX_CHAT_HISTORY_CHARS = 12000


def validate_code_length(code: str) -> None:
    """Reject code that is over the configured limit."""
    if len(code) > settings.MAX_CODE_LENGTH:
        raise ValueError(
            f"code exceeds the maximum length of {settings.MAX_CODE_LENGTH} characters"
        )


def validate_prompt_length(prompt: str) -> None:
    """Reject a prompt that is over the configured limit."""
    if len(prompt) > settings.MAX_PROMPT_LENGTH:
        raise ValueError(
            f"prompt exceeds the maximum length of {settings.MAX_PROMPT_LENGTH} characters"
        )


def truncate_chat_history(history: list[dict], max_chars: int = MAX_CHAT_HISTORY_CHARS):
    """Keep the most recent turns that fit inside the character budget.

    Chat history is the one place where input grows without a hard per-field
    limit, so it is capped by total size. Keeping the newest turns matters:
    the most recent question is the one being answered.
    """
    kept: list[dict] = []
    total = 0

    for message in reversed(history):
        length = len(message.get("content", ""))

        if total + length > max_chars and kept:
            break

        kept.append(message)
        total += length

    return list(reversed(kept))