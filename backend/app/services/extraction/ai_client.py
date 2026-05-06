from __future__ import annotations

import json
import logging
from typing import Any

from google import genai
from google.genai import errors as genai_errors

from app.core.config import settings
from app.services.extraction.types import AIExtractionError, ReadableContent

logger = logging.getLogger(__name__)


class AIExtractionClient:
    """Transforms readable text into schema-aligned structured data."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model_name: str | None = None,
        client: genai.Client | None = None,
    ) -> None:
        self._api_key = api_key or (
            settings.gemini_api_key.get_secret_value()
            if settings.gemini_api_key is not None
            else None
        )
        self._model_name = model_name or settings.gemini_model
        self._client = client or self._build_client()

    def extract(
        self,
        *,
        content: ReadableContent,
        schema_instructions: str,
        response_json_schema: dict[str, Any],
    ) -> dict[str, Any]:
        prompt = self._build_prompt(
            content=content,
            schema_instructions=schema_instructions,
        )
        logger.info(
            "Starting AI extraction request",
            extra={
                "model_name": self._model_name,
                "source_url": str(content.source_url),
                "has_title": bool(content.title),
                "content_length": len(content.readable_text),
            },
        )

        try:
            response = self._client.models.generate_content(
                model=self._model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": response_json_schema,
                    "temperature": 0,
                },
            )
        except genai_errors.ClientError as exc:
            logger.warning(
                "AI extraction failed with client error",
                extra={
                    "model_name": self._model_name,
                    "source_url": str(content.source_url),
                    "error_type": type(exc).__name__,
                },
            )
            raise AIExtractionError(
                "The AI extraction service could not process this link right now. Please try again."
            ) from exc
        except Exception as exc:
            logger.exception(
                "AI extraction failed with unexpected error",
                extra={
                    "model_name": self._model_name,
                    "source_url": str(content.source_url),
                    "error_type": type(exc).__name__,
                },
            )
            raise AIExtractionError(
                "The AI extraction service is unavailable right now. Please try again."
            ) from exc

        response_text = getattr(response, "text", None)
        if not response_text:
            logger.warning(
                "AI extraction returned empty response",
                extra={"model_name": self._model_name, "source_url": str(content.source_url)},
            )
            raise AIExtractionError(
                "The AI extraction service returned an empty response. Please try again."
            )

        try:
            payload = json.loads(response_text)
        except json.JSONDecodeError as exc:
            logger.warning(
                "AI extraction returned invalid JSON",
                extra={"model_name": self._model_name, "source_url": str(content.source_url)},
            )
            raise AIExtractionError(
                "The AI extraction service returned an invalid response. Please try again."
            ) from exc

        if not isinstance(payload, dict):
            logger.warning(
                "AI extraction returned unexpected JSON shape",
                extra={
                    "model_name": self._model_name,
                    "source_url": str(content.source_url),
                    "payload_type": type(payload).__name__,
                },
            )
            raise AIExtractionError(
                "The AI extraction service returned an unexpected response shape. Please try again."
            )

        logger.info(
            "Finished AI extraction request",
            extra={
                "model_name": self._model_name,
                "source_url": str(content.source_url),
                "response_keys": sorted(payload.keys()),
            },
        )

        return payload

    def _build_client(self) -> genai.Client:
        if not self._api_key:
            raise AIExtractionError(
                "Gemini is not configured yet. Add GEMINI_API_KEY before using link extraction."
            )

        return genai.Client(api_key=self._api_key)

    def _build_prompt(
        self,
        *,
        content: ReadableContent,
        schema_instructions: str,
    ) -> str:
        title_line = f"Page title: {content.title}" if content.title else "Page title: null"
        return (
            "You extract structured data from job or profile pages.\n"
            "Return JSON only that matches the provided schema.\n"
            "Use null for unknown values.\n"
            "Do not invent facts.\n"
            "Prefer explicit page content over assumptions.\n\n"
            f"Extraction instructions:\n{schema_instructions}\n\n"
            f"Source URL: {content.source_url}\n"
            f"{title_line}\n"
            "Readable page content:\n"
            f"{content.readable_text}"
        )
