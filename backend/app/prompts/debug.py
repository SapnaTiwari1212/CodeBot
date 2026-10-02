"""Debug: find the root cause using the user's error message."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Diagnose why this code is failing.

The user has supplied an error message or a description of the wrong behaviour.
Work from that evidence rather than guessing.

- root_cause: what is actually causing the failure, in plain language. Name the specific
  line or value involved.
- errors: the concrete symptoms to expect, such as the exception type or the wrong
  output.
- solution: the change that resolves it, described rather than coded.
- fixed_code: the complete corrected code with the fix applied."""

REQUIRED_KEYS = ["root_cause", "errors", "solution", "fixed_code"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"This {language} code is failing. Diagnose the root cause."
        f"{format_code_block(language, code)}"
        f"\nThe user reported this error or behaviour:\n<error>\n{prompt}\n</error>"
        if prompt
        else f"This {language} code is failing. Diagnose the root cause."
        f"{format_code_block(language, code)}\n"
        "The user did not supply an error message. Infer the likely failure from the code."
    )