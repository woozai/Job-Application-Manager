from __future__ import annotations

from typing import Any, Literal, Protocol

from pydantic import Field, HttpUrl

from app.schemas.base import BaseSchema

EntityType = Literal["job_application", "contact"]


class ExtractionError(Exception):
    """Base error for extraction pipeline failures."""


class UnsupportedEntityTypeError(ExtractionError):
    """Raised when no extraction adapter exists for the requested entity type."""


class FetchError(ExtractionError):
    """Raised when remote content cannot be fetched safely."""


class ReadableContentError(ExtractionError):
    """Raised when readable text cannot be derived from fetched content."""


class AIExtractionError(ExtractionError):
    """Raised when the AI provider cannot return valid structured data."""


class ExtractionRequest(BaseSchema):
    entity_type: EntityType
    url: HttpUrl
    raw_text: str | None = Field(
        default=None,
        description="Optional manually supplied text used when the URL content is unavailable or thin.",
    )


class ReadableContent(BaseSchema):
    source_url: HttpUrl
    title: str | None = None
    readable_text: str = Field(..., min_length=1)
    content_type: str | None = None


class ExtractionResult(BaseSchema):
    entity_type: EntityType
    data: dict[str, Any]
    warnings: list[str] = Field(default_factory=list)


class EntityExtractionAdapter(Protocol):
    entity_type: EntityType

    def schema_instructions(self) -> str:
        """Return entity-specific AI instructions."""
        ...

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        """Convert AI JSON into validated response data for the target entity."""
        ...
