from __future__ import annotations

import pytest

from app.services.extraction.ai_client import AIExtractionClient
from app.services.extraction.types import AIExtractionError, ReadableContent


class _FakeResponse:
    def __init__(self, text: str | None) -> None:
        self.text = text


class _FakeModels:
    def __init__(self, response: _FakeResponse | None = None, error: Exception | None = None) -> None:
        self._response = response
        self._error = error
        self.last_call: dict[str, object] | None = None

    def generate_content(self, **kwargs):
        self.last_call = kwargs
        if self._error is not None:
            raise self._error
        return self._response


class _FakeClient:
    def __init__(self, models: _FakeModels) -> None:
        self.models = models


def _sample_content() -> ReadableContent:
    return ReadableContent(
        source_url="https://example.com/jobs/123",
        title="Senior Backend Engineer",
        readable_text=(
            "Senior Backend Engineer\n"
            "Build APIs with Python, FastAPI, and SQLAlchemy.\n"
            "Hybrid role in Tel Aviv."
        ),
        content_type="text/html",
    )


def test_ai_extraction_client_requests_structured_json() -> None:
    fake_models = _FakeModels(
        response=_FakeResponse('{"company_name":"Example Inc","job_title":"Senior Backend Engineer"}')
    )
    client = AIExtractionClient(
        api_key="test-key",
        model_name="gemini-test-model",
        client=_FakeClient(fake_models),
    )

    payload = client.extract(
        content=_sample_content(),
        schema_instructions="Extract job fields.",
        response_json_schema={
            "type": "object",
            "properties": {
                "company_name": {"type": ["string", "null"]},
                "job_title": {"type": ["string", "null"]},
            },
            "required": ["company_name", "job_title"],
            "additionalProperties": False,
        },
    )

    assert payload["company_name"] == "Example Inc"
    assert fake_models.last_call is not None
    assert fake_models.last_call["model"] == "gemini-test-model"
    config = fake_models.last_call["config"]
    assert isinstance(config, dict)
    assert config["response_mime_type"] == "application/json"
    assert config["temperature"] == 0
    assert "Readabl" in str(fake_models.last_call["contents"])


def test_ai_extraction_client_rejects_invalid_json_response() -> None:
    fake_models = _FakeModels(response=_FakeResponse("not json"))
    client = AIExtractionClient(
        api_key="test-key",
        model_name="gemini-test-model",
        client=_FakeClient(fake_models),
    )

    with pytest.raises(AIExtractionError, match="invalid response"):
        client.extract(
            content=_sample_content(),
            schema_instructions="Extract job fields.",
            response_json_schema={"type": "object", "properties": {}, "additionalProperties": False},
        )


def test_ai_extraction_client_rejects_non_object_json() -> None:
    fake_models = _FakeModels(response=_FakeResponse('["wrong"]'))
    client = AIExtractionClient(
        api_key="test-key",
        model_name="gemini-test-model",
        client=_FakeClient(fake_models),
    )

    with pytest.raises(AIExtractionError, match="unexpected response shape"):
        client.extract(
            content=_sample_content(),
            schema_instructions="Extract job fields.",
            response_json_schema={"type": "object", "properties": {}, "additionalProperties": False},
        )


def test_ai_extraction_client_wraps_provider_errors() -> None:
    fake_models = _FakeModels(error=RuntimeError("boom"))
    client = AIExtractionClient(
        api_key="test-key",
        model_name="gemini-test-model",
        client=_FakeClient(fake_models),
    )

    with pytest.raises(AIExtractionError, match="unavailable"):
        client.extract(
            content=_sample_content(),
            schema_instructions="Extract job fields.",
            response_json_schema={"type": "object", "properties": {}, "additionalProperties": False},
        )
