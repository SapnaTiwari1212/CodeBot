"""Refactor: change the structure, preserve the behaviour."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Restructure this code so it is easier to maintain.

- changes: one entry per structural change you made, described in a few words.
- refactored_code: the complete refactored code. It must produce exactly the same
  results as the original for the same inputs.
- explanation: why the new structure is easier to work with.

Refactoring is not rewriting. Do not rename the public interface, change the
signature, or add or remove behaviour."""

REQUIRED_KEYS = ["changes", "refactored_code", "explanation"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Refactor this {language} code without changing its behaviour."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )