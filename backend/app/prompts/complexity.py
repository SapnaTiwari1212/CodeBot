"""Complexity: analyse time and space cost."""

from app.prompts.base import build_system_prompt, format_code_block, format_user_instructions

INSTRUCTIONS = """Analyse the algorithmic complexity of this code.

- time_complexity: the time complexity in Big O notation, plus one sentence on why.
- space_complexity: the space complexity in Big O notation, plus one sentence on why.
- explanation: a plain language explanation of how the cost grows as the input grows.
  Include the complexity of each significant function, and the overall complexity of a
  typical call path.
- bottlenecks: the lines or functions that dominate the cost, ordered from most to least
  expensive. Return an empty list if the code is trivial.

State the complexity of the code as written, not of an improved version."""

REQUIRED_KEYS = ["time_complexity", "space_complexity", "explanation", "bottlenecks"]

SYSTEM_PROMPT = build_system_prompt(INSTRUCTIONS, REQUIRED_KEYS)


def build_user_prompt(code: str, language: str, prompt: str = "") -> str:
    return (
        f"Analyse the complexity of this {language} code."
        f"{format_code_block(language, code)}"
        f"{format_user_instructions(prompt)}"
    )