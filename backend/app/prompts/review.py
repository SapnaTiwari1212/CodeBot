"""Review: a quality pass before the code ships."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Review this code the way an experienced engineer would in a pull
request.

- summary: an overall assessment in three or four sentences. State plainly whether the
  code is production ready.
- issues: concrete defects: incorrect logic, unhandled cases, missing error handling,
  resource leaks, or naming that misleads. Quote the relevant line. Return an empty list
  if you find none.
- security: real security concerns only, such as injection, unsafe deserialisation,
  missing authentication or authorisation, secret handling, and unvalidated input. Do not
  pad this list with generic advice.
- performance: real performance problems, such as a slow lookup inside a loop, an N+1
  query, unnecessary copying, or work done that could be avoided.
- suggestions: improvements worth making that are not defects, ordered by value."""

REQUIRED_KEYS = ["summary", "issues", "security", "performance", "suggestions"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Review this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )