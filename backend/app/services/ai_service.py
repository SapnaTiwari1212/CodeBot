"""The only module that talks to OpenAI.

Nothing else imports the OpenAI SDK. That is what guarantees the API key stays
on the server: the key is read from the backend settings here and is never
attached to a response.

Every call asks for a JSON object and nothing else. `response_format` makes the
model commit to JSON, and the prompt modules state the exact keys required.
"""
import logging

from openai import AsyncOpenAI, APITimeoutError, RateLimitError
from openai import APIError as OpenAIAPIError

from app.core.config import settings

logger = logging.getLogger("codebot.ai")

_client: AsyncOpenAI | None = None


class AiServiceError(Exception):
    """Any failure while calling the AI provider, already safe to show."""


def get_client() -> AsyncOpenAI:
    """Return the shared OpenAI client, created on first use."""
    global _client

    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY.get_secret_value(),
            timeout=settings.OPENAI_TIMEOUT_SECONDS,
        )

    return _client


async def complete(
    system_prompt: str,
    user_prompt: str,
    conversation: list[dict] | None = None,
) -> str:
    """Send one request and return the raw text reply.

    `conversation` carries earlier chat turns so a follow up question keeps its
    context instead of starting over.

    Raises AiServiceError with a message that is safe to return to the client.
    """
    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    if conversation:
        messages.extend(conversation)

    messages.append({"role": "user", "content": user_prompt})

    try:
        response = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
    except RateLimitError as error:
        logger.warning("OpenAI rate limit reached: %s", type(error).__name__)
        raise AiServiceError(
            "The AI service is busy right now. Please wait a moment and try again."
        ) from error
    except APITimeoutError as error:
        logger.warning("OpenAI request timed out")
        raise AiServiceError(
            "The AI took too long to respond. Try again with a smaller snippet."
        ) from error
    except OpenAIAPIError as error:
        # The message can contain request details, so only the type is logged
        # and the client gets a generic explanation.
        logger.error("OpenAI API error: %s", type(error).__name__)
        raise AiServiceError(
            "The AI service could not be reached. Please try again."
        ) from error

    content = response.choices[0].message.content

    if not content:
        raise AiServiceError("The AI returned an empty response")

    return content