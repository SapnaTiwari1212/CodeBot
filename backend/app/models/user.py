"""Shapes of the documents stored in MongoDB.

These are read models, not request models. Keeping them separate from the API
schemas means an internal field can be added to a document without immediately
becoming part of the public API contract.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UserDocument(BaseModel):
    """A document in the `users` collection."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    email: str
    password_hash: str
    created_at: datetime
    updated_at: datetime

    @property
    def public_dict(self) -> dict[str, Any]:
        """Fields that are safe to send to a client.

        `password_hash` is deliberately absent. Serialising the document
        directly would leak it, which is why responses are built from here.
        """
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at,
        }