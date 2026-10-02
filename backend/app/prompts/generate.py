"""Generate: write new code from a description."""

from app.prompts.base import build_system_prompt, format_user_instructions

INSTRUCTIONS = """Write code that satisfies the user's description.

- approach: how you solved it, in a short paragraph, including any assumption you had to
  make.
- code: the complete, runnable code. It must stand alone: include any import, function
  signature or boilerplate needed to use it. Do not write "// rest of the code" or any
  other placeholder.
- explanation: a walkthrough of how the code works, for someone learning the language.
- usage: at least one concrete example of calling or running the code with sample input
  and what it produces.

If the description is ambiguous, choose the most reasonable interpretation, state the
assumption in `approach`, and make the code work for that interpretation."""

REQUIRED_KEYS = ["approach", "code", "explanation", "usage"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(prompt: str, language: str) -> str:
    return (
        f"Write {language} code for the following description."
        f"{format_user_instructions(prompt)}"
    )