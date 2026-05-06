from __future__ import annotations

import ipaddress
import logging
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.services.extraction.types import FetchError

BLOCKED_HOSTNAMES = {"localhost"}
BLOCKED_HOST_SUFFIXES = (".local",)
SUPPORTED_CONTENT_TYPES = (
    "text/html",
    "text/plain",
    "application/xhtml+xml",
)
logger = logging.getLogger(__name__)


class LinkFetcher:
    """Fetches remote content for the extraction pipeline."""

    def __init__(
        self,
        *,
        timeout_seconds: float | None = None,
        max_response_bytes: int | None = None,
    ) -> None:
        self._timeout_seconds = (
            timeout_seconds
            if timeout_seconds is not None
            else settings.extraction_fetch_timeout_seconds
        )
        self._max_response_bytes = (
            max_response_bytes
            if max_response_bytes is not None
            else settings.extraction_max_response_bytes
        )

    def fetch(self, url: str) -> str:
        safe_url = self._validate_url(url)
        timeout = httpx.Timeout(self._timeout_seconds)
        hostname = urlparse(safe_url).hostname or "unknown-host"

        logger.info("Starting remote fetch for extraction", extra={"url": safe_url, "hostname": hostname})

        try:
            with httpx.Client(
                follow_redirects=True,
                timeout=timeout,
                headers={"User-Agent": "JobApplicationManagerBot/1.0"},
            ) as client:
                with client.stream("GET", safe_url) as response:
                    response.raise_for_status()
                    self._validate_response_headers(response)
                    body = self._read_response_body(response)
                    logger.info(
                        "Finished remote fetch for extraction",
                        extra={
                            "url": safe_url,
                            "hostname": hostname,
                            "content_type": response.headers.get("Content-Type", ""),
                            "body_length": len(body),
                        },
                    )
                    return body
        except httpx.TimeoutException as exc:
            logger.warning(
                "Extraction fetch timed out",
                extra={"url": safe_url, "hostname": hostname, "timeout_seconds": self._timeout_seconds},
            )
            raise FetchError(
                "The link took too long to respond. Please try another link or paste the job description."
            ) from exc
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "Extraction fetch returned HTTP error",
                extra={
                    "url": safe_url,
                    "hostname": hostname,
                    "status_code": exc.response.status_code,
                },
            )
            raise FetchError(
                "The link could not be accessed. Please check the URL or paste the job description."
            ) from exc
        except httpx.HTTPError as exc:
            logger.warning(
                "Extraction fetch failed with transport error",
                extra={"url": safe_url, "hostname": hostname, "error_type": type(exc).__name__},
            )
            raise FetchError(
                "We could not read that link right now. Please try again or paste the job description."
            ) from exc

    def _validate_url(self, url: str) -> str:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname

        if parsed_url.scheme not in {"http", "https"} or not hostname:
            logger.warning("Rejected extraction URL because scheme or host is invalid", extra={"url": url})
            raise FetchError("Only valid http and https links are supported.")

        if parsed_url.username or parsed_url.password:
            logger.warning("Rejected extraction URL with embedded credentials", extra={"url": url})
            raise FetchError("Links with embedded credentials are not supported.")

        normalized_hostname = hostname.lower()
        if normalized_hostname in BLOCKED_HOSTNAMES or normalized_hostname.endswith(
            BLOCKED_HOST_SUFFIXES
        ):
            logger.warning(
                "Rejected extraction URL because hostname is blocked",
                extra={"url": url, "hostname": normalized_hostname},
            )
            raise FetchError("That link target is not allowed.")

        self._validate_hostname_address(normalized_hostname)
        return url

    def _validate_hostname_address(self, hostname: str) -> None:
        try:
            ip_address = ipaddress.ip_address(hostname)
        except ValueError:
            return

        if (
            ip_address.is_private
            or ip_address.is_loopback
            or ip_address.is_link_local
            or ip_address.is_multicast
            or ip_address.is_reserved
            or ip_address.is_unspecified
        ):
            logger.warning(
                "Rejected extraction URL because IP target is unsafe",
                extra={"hostname": hostname, "ip_address": str(ip_address)},
            )
            raise FetchError("That link target is not allowed.")

    def _validate_response_headers(self, response: httpx.Response) -> None:
        content_length = response.headers.get("Content-Length")
        if content_length is not None:
            try:
                parsed_length = int(content_length)
            except ValueError:
                parsed_length = None
            else:
                if parsed_length > self._max_response_bytes:
                    logger.warning(
                        "Rejected extraction response because declared size is too large",
                        extra={"content_length": parsed_length, "max_response_bytes": self._max_response_bytes},
                    )
                    raise FetchError(
                        "The page is too large to process safely. Please paste the job description instead."
                    )

        content_type = response.headers.get("Content-Type", "").lower()
        if content_type and not any(
            supported_type in content_type for supported_type in SUPPORTED_CONTENT_TYPES
        ):
            logger.warning(
                "Rejected extraction response because content type is unsupported",
                extra={"content_type": content_type},
            )
            raise FetchError("That link does not contain a supported text page.")

    def _read_response_body(self, response: httpx.Response) -> str:
        chunks: list[str] = []
        total_bytes = 0

        for chunk in response.iter_text():
            chunk_bytes = len(chunk.encode(response.encoding or "utf-8", errors="ignore"))
            total_bytes += chunk_bytes
            if total_bytes > self._max_response_bytes:
                logger.warning(
                    "Rejected extraction response because streamed body exceeded limit",
                    extra={"body_bytes": total_bytes, "max_response_bytes": self._max_response_bytes},
                )
                raise FetchError(
                    "The page is too large to process safely. Please paste the job description instead."
                )
            chunks.append(chunk)

        body = "".join(chunks).strip()
        if not body:
            logger.warning("Rejected extraction response because body was empty after fetch")
            raise FetchError("The link did not return readable page content.")

        return body
