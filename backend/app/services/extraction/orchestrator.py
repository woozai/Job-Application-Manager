from __future__ import annotations

from app.services.extraction.ai_client import AIExtractionClient
from app.services.extraction.fetcher import LinkFetcher
from app.services.extraction.readable_content import ReadableContentExtractor
from app.services.extraction.registry import (
    EntityExtractionRegistry,
    build_default_entity_extraction_registry,
)
from app.services.extraction.types import (
    ExtractionRequest,
    ExtractionResult,
    ReadableContent,
    ReadableContentError,
)


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
        try:
            content = self._build_readable_content(request)
        except ReadableContentError as exc:
            return ExtractionResult(
                entity_type=request.entity_type,
                data={},
                warnings=[exc.message],
            )

        payload = self._ai_client.extract(
            content=content,
            schema_instructions=adapter.schema_instructions(),
            response_json_schema=adapter.response_json_schema(),
        )
        result = adapter.normalize(payload)
        warnings = list(result.warnings)
        warnings.extend(self._build_missing_field_warnings(result, adapter.warning_fields()))
        if request.raw_text:
            warnings.append("Used pasted text because link extraction was unavailable or incomplete.")

        return ExtractionResult(
            entity_type=result.entity_type,
            data=result.data,
            warnings=self._dedupe_warnings(warnings),
        )

    def _build_readable_content(self, request: ExtractionRequest) -> ReadableContent:
        if request.raw_text:
            return ReadableContent(
                source_url=request.url,
                readable_text=request.raw_text,
            )

        html = self._fetcher.fetch(str(request.url))
        return self._readable_content_extractor.extract(request.url, html)

    def _build_missing_field_warnings(
        self,
        result: ExtractionResult,
        warning_fields: set[str],
    ) -> list[str]:
        missing_fields = [
            field_name for field_name in sorted(warning_fields) if not result.data.get(field_name)
        ]
        if not missing_fields:
            return []

        readable_fields = ", ".join(field_name.replace("_", " ") for field_name in missing_fields)
        return [f"Some important fields could not be extracted: {readable_fields}."]

    def _dedupe_warnings(self, warnings: list[str]) -> list[str]:
        deduped: list[str] = []
        seen: set[str] = set()
        for warning in warnings:
            normalized_warning = warning.strip()
            if not normalized_warning or normalized_warning in seen:
                continue
            seen.add(normalized_warning)
            deduped.append(normalized_warning)

        return deduped


def build_default_extraction_orchestrator() -> ExtractionOrchestrator:
    return ExtractionOrchestrator(
        registry=build_default_entity_extraction_registry(),
        fetcher=LinkFetcher(),
        readable_content_extractor=ReadableContentExtractor(),
        ai_client=AIExtractionClient(),
    )


def extract_from_link(
    entity_type: str,
    url: str,
    *,
    raw_text: str | None = None,
    orchestrator: ExtractionOrchestrator | None = None,
) -> ExtractionResult:
    service = orchestrator or build_default_extraction_orchestrator()
    request = ExtractionRequest(
        entity_type=entity_type,
        url=url,
        raw_text=raw_text,
    )
    return service.extract_from_link(request)
