"""Chat: answer follow up questions about the code in the editor.

Chat is the one operation that returns plain text instead of JSON. A
conversation has no fixed shape to validate, and forcing it into one produces
worse answers. It also keeps the history messages so a follow up question such as
"why did you change that?" still has the context it needs.
"""

from app.prompts.base import BASE_RULES, format_code_block, format_user_instructions

INSTRUCTIONS = """You are in a conversation about the code currently in the user's
editor.

- Answer the question that was actually asked, directly and first.
- Refer to the code by name: the function, variable or line you are discussing.
- If the question is ambiguous, answer your best reading of it and say which reading you
  took, rather than replying only with a request for clarification.
- If the answer requires code, include it in a fenced code block using the language of the
  editor.
- If something the user asked for is impossible or a bad idea, say so and explain why.
- Keep answers concise. Use short paragraphs or a few bullet points.

Reply with plain text. Do not return JSON for this operation."""


def build_system_prompt(language: str) -> str:
    """Chat's system prompt varies because it names the editor language."""
    return (
        f"{BASE_RULES}\n\nThe code in the editor is {language}.\n\n{INSTRUCTIONS}"
    )


def build_user_prompt(code: str, language: str, message: str) -> str:
    return (
        f"This is the code currently in my editor:"
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(message)}"
    )


def build_conversation(history: list[dict]) -> list[dict]:
    """Convert stored chat turns into OpenAI messages.

    Only the two supported roles are forwarded, so nothing else that reached the
    database can be replayed back to the model as a new instruction.
    """
    messages: list[dict] = []

    for message in history:
        if message.get("role") in {"user", "assistant"}:
            messages.append(
                {
                    "role": message["role"],
                    "content": message.get("content", ""),
                }
            )

    return messages