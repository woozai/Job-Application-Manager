from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.services.extraction.fetcher import LinkFetcher
from app.services.extraction.types import ExtractionRequest, FetchError


def test_extraction_request_rejects_non_http_scheme() -> None:
    with pytest.raises(ValidationError):
        ExtractionRequest.model_validate(
            {"entity_type": "job_application", "url": "ftp://example.com/job"}
        )


def test_fetcher_rejects_localhost_targets() -> None:
    fetcher = LinkFetcher()

    with pytest.raises(FetchError, match="not allowed"):
        fetcher.fetch("http://localhost/job")


def test_fetcher_rejects_private_ip_targets() -> None:
    fetcher = LinkFetcher()

    with pytest.raises(FetchError, match="not allowed"):
        fetcher.fetch("http://192.168.1.10/job")


def test_fetcher_rejects_embedded_credentials() -> None:
    fetcher = LinkFetcher()

    with pytest.raises(FetchError, match="embedded credentials"):
        fetcher.fetch("https://user:pass@example.com/job")
