from __future__ import annotations

from app.services.extraction.ai_client import AIExtractionClient
from app.services.extraction.fetcher import LinkFetcher
from app.services.extraction.readable_content import ReadableContentExtractor
from app.services.extraction.registry import EntityExtractionRegistry
from app.services.extraction.types import ExtractionRequest, ExtractionResult, ReadableContent


class ExtractionOrchestrator:
    """High-level entry point for link-based extraction."""

    def __init__(
        self,
        *,
        registry: EntityExtractionRegistry,
        fetcher: LinkFetcher,
        readable_content_extractor: ReadableContentExtractor,
        ai_client: AIExtractionClient,
    ) -> None:
        self._registry = registry
        self._fetcher = fetcher
        self._readable_content_extractor = readable_content_extractor
        self._ai_client = ai_client

    def extract_from_link(self, request: ExtractionRequest) -> ExtractionResult:
        adapter = self._registry.get(request.entity_type)
        content = self._build_readable_content(request)
        payload = self._ai_client.extract(
            content=content,
            schema_instructions=adapter.schema_instructions(),
        )
        return adapter.normalize(payload)

    def _build_readable_content(self, request: ExtractionRequest) -> ReadableContent:
        if request.raw_text:
            return ReadableContent(
                source_url=request.url,
                readable_text=request.raw_text,
            )

        html = self._fetcher.fetch(str(request.url))
        return self._readable_content_extractor.extract(request.url, html)
