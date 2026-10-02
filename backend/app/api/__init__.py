"""API layer: HTTP routers only.

Route modules validate input with Pydantic, delegate to a service, and return a
response model. They do not talk to MongoDB or OpenAI directly.
"""

__all__ = ["routes"]