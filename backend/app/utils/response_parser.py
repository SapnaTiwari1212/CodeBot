"""Turning an AI reply into a validated result object.

A model asked for JSON will usually comply, but not always. It may wrap the
JSON in a markdown fence, add a sentence of commentary, or return prose when the
code made no sense. This module is the single place that copes with that, so the
rest of the application can assume a real dict.

The rule is: extract the best JSON we can find, validate it against the
operation's model, and raise a typed error if it still does not fit. Guessing at
missing fields would put fabricated data into the user's history, which is worse
than an honest failure.
"""

import json
import re
from typing import Any

from pydantic import BaseModel, ValidationError

from app.schemas.codebot import RESULT_MODELS

# ```json ... ``` or ``` ... ```
_FENCE_PATTERN = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)


class AiResponseError(Exception):
    """Raised when the model's reply cannot be turned into a valid result."""


def extract_json_text(content: str) -> str:
    """Pull the JSON payload out of a model reply.

    Handles the three shapes seen in practice: a bare JSON object, a fenced
    code block, and JSON with commentary around it.
    """
    if not content or not content.strip():
        raise AiResponseError("The AI returned an empty response")

    text = content.strip()

    # 1. Already valid JSON.
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # 2. JSON inside a markdown fence.
    fence_match = _FENCE_PATTERN.search(text)
    if fence_match:
        candidate = fence_match.group(1).strip()
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            text = candidate

    # 3. The outermost JSON object or array anywhere in the text.
    for opening, closing in (("{", "}"), ("[", "]")):
        start = text.find(opening)
        end = text.rfind(closing)

        if start != -1 and end > start:
            candidate = text[start : end + 1]
            try:
                json.loads(candidate)
                return candidate
            except json.JSONDecodeError:
                continue

    raise AiResponseError("The AI response was not valid JSON")


def parse_result(operation: str, content: str) -> dict[str, Any]:
    """Validate a reply against the model for `operation`.

    Returns the result as a plain dict so it can be stored in MongoDB and sent
    to the frontend without carrying the Pydantic object around.
    """
    model: type[BaseModel] | None = RESULT_MODELS.get(operation)

    if model is None:
        raise AiResponseError(f"No result model is defined for operation '{operation}'")

    json_text = extract_json_text(content)

    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as error:
        raise AiResponseError("The AI response was not valid JSON") from error

    if not isinstance(parsed, dict):
        raise AiResponseError("The AI response was not a JSON object")

    try:
        validated = model.model_validate(parsed)
    except ValidationError as error:
        # Report which fields were wrong, without echoing the whole reply back.
        fields = ", ".join(
            ".".join(str(part) for part in item["loc"]) for item in error.errors()
        )
        raise AiResponseError(f"The AI response did not match the expected shape ({fields})") from error

    return validated.model_dump()