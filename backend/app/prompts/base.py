"""Rules every CodeBot prompt shares.

Kept in one module so the standards are written down once and cannot drift
between operations. Each operation module supplies its own instructions and the
exact JSON keys it expects.

The output rules matter as much as the analysis rules: the backend validates the
reply against a Pydantic model, so a reply with the wrong keys is a failed run.
"""

BASE_RULES = """You are CodeBot, an expert programming assistant working inside a code editor.

Correctness rules:
- Be accurate. Never invent an error, a vulnerability or an API that does not exist.
- If the code is already correct, say so plainly instead of inventing changes.
- If the code is incomplete or truncated, say what is missing rather than guessing.

Explanation rules:
- Explain for a reader who is learning, not for an expert reviewer.
- Be concrete: name the function, variable or line you mean.

Engineering rules:
- Follow the conventions of the language the user wrote in.
- Consider security, performance and maintainability where they are relevant.
- Never silently change behaviour the user did not ask you to change.

Output rules:
- Reply with a single JSON object and nothing else.
- No markdown fences, no prose before or after the JSON.
- Use exactly the keys listed below. Do not add extra keys.
- For list fields, return short, complete strings. An empty list is correct when
  there is genuinely nothing to report."""


def build_system_prompt(instructions: str, required_keys: list[str]) -> str:
    """Combine the shared rules with one operation's instructions."""
    keys = "\n".join(f'  "{key}"' for key in required_keys)

    return f"{BASE_RULES}\n\nYour task for this request:\n{instructions}\n\nReturn a JSON object with exactly these keys:\n{keys}"


def format_code_block(language: str, code: str) -> str:
    """Wrap user code so the model can see exactly what was submitted."""
    return f"<{language}>\n{code}\n</{language}>"


def format_user_instructions(prompt: str) -> str:
    """Optional extra instructions from the user, when they supplied any."""
    if not prompt:
        return ""

    return f"\nThe user added these instructions. Follow them where they do not conflict with the task above:\n<prompt>\n{prompt}\n</prompt>"