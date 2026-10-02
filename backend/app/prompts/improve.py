"""Improve: make the code clearer without changing what it does."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Improve the readability and structure of this code.

- analysis: what the code does well and what is hard to read, in a few sentences.
- improvements: one entry per concrete improvement. Order them by value. Focus on naming,
  structure, dead code, error handling and removing duplication.
- improved_code: the full improved code. It must behave identically to the original.
  Do not add features or change the interface."""

REQUIRED_KEYS = ["analysis", "improvements", "improved_code"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Improve the readability of this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )