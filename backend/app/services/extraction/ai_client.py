from __future__ import annotations

from typing import Any

from app.services.extraction.types import AIExtractionError, ReadableContent


class AIExtractionClient:
    """Transforms readable text into schema-aligned structured data."""

    def extract(
        self,
        *,
        content: ReadableContent,
        schema_instructions: str,
    ) -> dict[str, Any]:
        raise AIExtractionError("AI extraction is not implemented yet.")
