"""Explain: make the code understandable."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Explain what this code does.

- summary: two or three sentences on the overall purpose, written for someone who has
  never seen this file.
- explanation: a clear walkthrough of how it works, in the order the code runs.
- line_by_line: one entry per meaningful line or small block. Skip blank lines, closing
  brackets and imports that are not relevant to the behaviour.
- concepts: the programming concepts a reader needs to understand this code, such as a
  particular loop, data structure or language feature.
- suggestions: at most three things worth improving. Return an empty list when the
  code is already clear."""

REQUIRED_KEYS = ["summary", "explanation", "line_by_line", "concepts", "suggestions"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Explain this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )