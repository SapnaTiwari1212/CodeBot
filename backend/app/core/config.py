"""Application configuration.

Every environment variable the backend needs is declared here once. The settings
object is built a single time at import time, so a missing or malformed value
fails immediately at startup instead of failing later inside a request.

Secrets are typed as ``SecretStr`` so that printing or logging a settings object
masks them instead of leaking them.
"""

from pathlib import Path
from typing import Annotated

from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# backend/app/core/config.py -> parents[2] is the backend/ directory.
# Resolving the path this way means the .env file is found no matter which
# directory the server was started from.
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Values read from environment variables and the backend .env file."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    APP_NAME: str = "CodeBot API"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api"

    # --- Database ---
    MONGODB_URI: str
    DATABASE_NAME: str = "codebot"

    # --- Authentication ---
    JWT_SECRET: SecretStr
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # --- AI ---
    # Read on the backend only. Never sent to the browser.
    OPENAI_API_KEY: SecretStr
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TIMEOUT_SECONDS: float = 60.0

    # --- CORS ---
    # Comma separated in .env, for example:
    # CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
    #
    # NoDecode stops pydantic-settings from trying to JSON-parse this value.
    # Without it a plain string like "http://localhost:5173" would raise a
    # JSONDecodeError before the validator below ever runs.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # --- Input limits enforced on every request that carries user text ---
    MAX_CODE_LENGTH: int = 20_000
    MAX_PROMPT_LENGTH: int = 2_000
    MAX_CHAT_MESSAGE_LENGTH: int = 2_000
    MAX_CHAT_HISTORY_MESSAGES: int = 20

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def split_cors_origins(cls, value: object) -> object:
        """Turn the comma separated CORS_ORIGINS string into a list."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def reject_wildcard_cors_in_production(self) -> "Settings":
        """A wildcard origin with credentials enabled is never acceptable."""
        if self.ENVIRONMENT.lower() == "production" and "*" in self.CORS_ORIGINS:
            raise ValueError(
                "CORS_ORIGINS cannot contain '*' when ENVIRONMENT is 'production'. "
                "List the exact frontend origins instead."
            )
        return self


settings = Settings()