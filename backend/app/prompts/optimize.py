"""Optimize: make it faster or use less memory."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Analyse and improve the efficiency of this code.

- current_complexity: the time and space complexity of the original, in Big O notation,
  and the assumed input size.
- optimized_complexity: the complexity after your change, in the same form. Only claim an
  improvement you can justify.
- optimization_explanation: what was slow and why the new version is faster.
- optimized_code: the complete optimized code that produces the same results.

Prefer real algorithmic wins over micro-optimizations. If the code is already
efficient, say so and return the original code unchanged."""

REQUIRED_KEYS = [
    "current_complexity",
    "optimized_complexity",
    "optimization_explanation",
    "optimized_code",
]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Analyse and optimize this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )