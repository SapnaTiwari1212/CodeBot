"""Convert: translate code into another language."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Translate this code into the target language, keeping the behaviour
identical.

- source_language: the language you were given.
- target_language: the language you produced.
- converted_code: the complete translated code. It must compile or run in the target
  language and preserve the original logic, output and edge case handling.
- notes: one entry per real difference the user needs to know, such as a different
  standard library call, a different way of handling errors, or an idiom that has no
  direct equivalent. Return an empty list if the translation is direct.

Use the idioms and standard library of the target language rather than translating
syntax word for word. Do not leave translator comments such as "the equivalent of
this loop in the new language"."""

REQUIRED_KEYS = ["source_language", "target_language", "converted_code", "notes"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, target_language: str, prompt: str = "") -> str:
    return (
        f"Convert this {language} code to {target_language}."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )