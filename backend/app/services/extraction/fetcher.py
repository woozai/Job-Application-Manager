from __future__ import annotations

from app.services.extraction.types import FetchError


class LinkFetcher:
    """Fetches remote content for the extraction pipeline."""

    def fetch(self, url: str) -> str:
        raise FetchError("Link fetching is not implemented yet.")
