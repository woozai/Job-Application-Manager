from __future__ import annotations

from pydantic import HttpUrl

from app.services.extraction.orchestrator import ExtractionOrchestrator
from app.services.extraction.readable_content import ReadableContent
from app.services.extraction.registry import build_default_entity_extraction_registry
from app.services.extraction.types import ExtractionRequest, ReadableContentError


class _FakeFetcher:
    def __init__(self, html: str = "<html></html>") -> None:
        self.html = html

    def fetch(self, url: str) -> str:
        return self.html


class _FakeReadableContentExtractor:
    def __init__(
        self,
        content: ReadableContent | None = None,
        error: Exception | None = None,
    ) -> None:
        self.content = content
        self.error = error

    def extract(self, source_url: HttpUrl, html: str) -> ReadableContent:
        if self.error is not None:
            raise self.error
        assert self.content is not None
        return self.content


class _FakeAIClient:
    def __init__(self, payload: dict[str, object]) -> None:
        self.payload = payload

    def extract(self, **kwargs) -> dict[str, object]:
        return self.payload


def test_orchestrator_returns_warnings_for_missing_primary_fields() -> None:
    orchestrator = ExtractionOrchestrator(
        registry=build_default_entity_extraction_registry(),
        fetcher=_FakeFetcher(),
        readable_content_extractor=_FakeReadableContentExtractor(
            content=ReadableContent(
                source_url="https://example.com/jobs/123",
                title="Backend Engineer",
                readable_text="Readable job text long enough for extraction.",
                content_type="text/html",
            )
        ),
        ai_client=_FakeAIClient(
            {
                "company_name": "Example Inc",
                "job_title": "Backend Engineer",
                "location": None,
                "full_description": "Build APIs",
                "required_skills": None,
            }
        ),
    )

    result = orchestrator.extract_from_link(
        ExtractionRequest(entity_type="job_application", url="https://example.com/jobs/123")
    )

    assert result.data["company_name"] == "Example Inc"
    assert any("location" in warning for warning in result.warnings)
    assert any("required skills" in warning for warning in result.warnings)


def test_orchestrator_returns_clean_warning_for_thin_content() -> None:
    orchestrator = ExtractionOrchestrator(
        registry=build_default_entity_extraction_registry(),
        fetcher=_FakeFetcher(),
        readable_content_extractor=_FakeReadableContentExtractor(
            error=ReadableContentError("We could not find enough readable content on linkedin.com.")
        ),
        ai_client=_FakeAIClient({}),
    )

    result = orchestrator.extract_from_link(
        ExtractionRequest(entity_type="job_application", url="https://linkedin.com/jobs/view/123")
    )

    assert result.data == {}
    assert result.warnings == ["We could not find enough readable content on linkedin.com."]


def test_orchestrator_adds_pasted_text_warning() -> None:
    orchestrator = ExtractionOrchestrator(
        registry=build_default_entity_extraction_registry(),
        fetcher=_FakeFetcher(),
        readable_content_extractor=_FakeReadableContentExtractor(
            content=ReadableContent(
                source_url="https://example.com/jobs/123",
                title="Ignored",
                readable_text="Ignored because raw text is used.",
                content_type="text/html",
            )
        ),
        ai_client=_FakeAIClient(
            {
                "company_name": "Example Inc",
                "job_title": "Backend Engineer",
                "location": "Tel Aviv",
                "full_description": "Build APIs",
                "required_skills": "Python",
            }
        ),
    )

    result = orchestrator.extract_from_link(
        ExtractionRequest(
            entity_type="job_application",
            url="https://example.com/jobs/123",
            raw_text="Backend Engineer role at Example Inc with Python work.",
        )
    )

    assert any("Used pasted text" in warning for warning in result.warnings)
