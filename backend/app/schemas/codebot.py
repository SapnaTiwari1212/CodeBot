"""Request and response schemas for the CodeBot endpoints.

The request model is where input validation happens. Operation, language and
target_language are `Literal` types rather than free strings, so FastAPI
rejects an unsupported value with a 422 before any code reaches a service.

Each operation has its own result model. That is what makes the AI layer
structured rather than a string that happens to contain JSON: the reply is
parsed into a known shape, and a reply that does not fit fails loudly.
"""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings

# --- The vocabulary shared with the frontend -------------------------------

LanguageId = Literal[
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "html",
    "css",
    "sql",
]

OperationId = Literal[
    "explain",
    "fix",
    "debug",
    "improve",
    "refactor",
    "optimize",
    "generate",
    "convert",
    "complexity",
    "review",
    "chat",
]

MAX_CODE_LENGTH = settings.MAX_CODE_LENGTH
MAX_PROMPT_LENGTH = settings.MAX_PROMPT_LENGTH


# --- Request ---------------------------------------------------------------


class CodeRunRequest(BaseModel):
    operation: OperationId
    language: LanguageId
    target_language: LanguageId | None = None
    code: str = Field(min_length=1, max_length=MAX_CODE_LENGTH)
    prompt: str = Field(default="", max_length=MAX_PROMPT_LENGTH)

    @field_validator("code")
    @classmethod
    def code_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("code cannot be empty or only whitespace")
        return value

    @field_validator("prompt")
    @classmethod
    def prompt_must_not_be_blank(cls, value: str) -> str:
        return value.strip()

    def validate_operation_rules(self) -> None:
        """Cross field rules that a field validator cannot express.

        * `convert` needs a target language, and it cannot be the source.
        * `generate` needs a description, since the code is the output.
        * Any other operation must not carry a target language, because there
          is nothing meaningful for the backend to do with it.
        """
        if self.operation == "convert":
            if not self.target_language:
                raise ValueError("target_language is required for the convert operation")
            if self.target_language == self.language:
                raise ValueError("target_language must differ from language")

        if self.operation != "convert" and self.target_language:
            raise ValueError("target_language is only valid for the convert operation")

        if self.operation == "generate" and not self.prompt:
            raise ValueError("prompt is required for the generate operation")


class ChatMessage(BaseModel):
    """One turn in a CodeBot conversation."""

    role: Literal["user", "assistant"]
    content: Annotated[str, Field(min_length=1, max_length=settings.MAX_CHAT_MESSAGE_LENGTH)]


class ChatRequest(BaseModel):
    message: Annotated[
        str, Field(min_length=1, max_length=settings.MAX_CHAT_MESSAGE_LENGTH)
    ]
    code: str = Field(min_length=1, max_length=MAX_CODE_LENGTH)
    language: LanguageId
    history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=settings.MAX_CHAT_HISTORY_MESSAGES,
    )


# --- Responses --------------------------------------------------------------


class ExplainResult(BaseModel):
    summary: str
    explanation: str
    line_by_line: list[str] = Field(default_factory=list)
    concepts: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class FixResult(BaseModel):
    problem: str
    errors: list[str] = Field(default_factory=list)
    fixed_code: str
    explanation: str


class DebugResult(BaseModel):
    root_cause: str
    errors: list[str] = Field(default_factory=list)
    solution: str
    fixed_code: str


class ImproveResult(BaseModel):
    analysis: str
    improvements: list[str] = Field(default_factory=list)
    improved_code: str


class RefactorResult(BaseModel):
    changes: list[str] = Field(default_factory=list)
    refactored_code: str
    explanation: str


class OptimizeResult(BaseModel):
    current_complexity: str
    optimized_complexity: str
    optimization_explanation: str
    optimized_code: str


class GenerateResult(BaseModel):
    approach: str
    code: str
    explanation: str
    usage: str


class ConvertResult(BaseModel):
    source_language: str
    target_language: str
    converted_code: str
    notes: list[str] = Field(default_factory=list)


class ComplexityResult(BaseModel):
    time_complexity: str
    space_complexity: str
    explanation: str
    bottlenecks: list[str] = Field(default_factory=list)


class ReviewResult(BaseModel):
    summary: str
    issues: list[str] = Field(default_factory=list)
    security: list[str] = Field(default_factory=list)
    performance: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


#: Maps an operation to the model its result must satisfy.
RESULT_MODELS: dict[str, type[BaseModel]] = {
    "explain": ExplainResult,
    "fix": FixResult,
    "debug": DebugResult,
    "improve": ImproveResult,
    "refactor": RefactorResult,
    "optimize": OptimizeResult,
    "generate": GenerateResult,
    "convert": ConvertResult,
    "complexity": ComplexityResult,
    "review": ReviewResult,
}


class CodeRunResponse(BaseModel):
    """What POST /api/codebot/run returns."""

    id: str
    operation: OperationId
    language: LanguageId
    target_language: LanguageId | None = None
    result: dict
    status: Literal["success", "error"]
    duration_seconds: float | None = None
    created_at: datetime


class ChatResponse(BaseModel):
    reply: str