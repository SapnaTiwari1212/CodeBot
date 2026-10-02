"""Fix: repair code that is broken."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Find and repair the problems in this code.

- problem: one or two sentences describing what is wrong overall.
- errors: one entry per distinct problem. Include the line or construct at fault.
  Return an empty list only if the code is genuinely correct.
- fixed_code: the complete corrected code, not a diff and not a fragment.
- explanation: why the fix works, and anything the user must also change."""

REQUIRED_KEYS = ["problem", "errors", "fixed_code", "explanation"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Find and fix the problems in this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )