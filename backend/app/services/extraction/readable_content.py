from __future__ import annotations

from app.services.extraction.types import ReadableContent, ReadableContentError


class ReadableContentExtractor:
    """Converts fetched page content into AI-ready readable text."""

    def extract(self, source_url: str, html: str) -> ReadableContent:
        raise ReadableContentError("Readable content extraction is not implemented yet.")
