from __future__ import annotations

import re
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urlparse

from pydantic import HttpUrl

from app.services.extraction.types import ReadableContent, ReadableContentError

WHITESPACE_PATTERN = re.compile(r"\s+")
COMMENT_PATTERN = re.compile(r"<!--.*?-->", re.DOTALL)
TITLE_PATTERN = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
BLOCK_SEPARATOR_TAGS = {
    "article",
    "aside",
    "blockquote",
    "br",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "li",
    "main",
    "p",
    "section",
    "tr",
}
SKIP_TAGS = {
    "aside",
    "button",
    "footer",
    "form",
    "head",
    "header",
    "iframe",
    "label",
    "nav",
    "noscript",
    "option",
    "script",
    "select",
    "style",
    "svg",
    "textarea",
}
THIN_CONTENT_MIN_LENGTH = 120


class _ReadableHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_stack: list[str] = []
        self._parts: list[str] = []

    @property
    def text(self) -> str:
        return "".join(self._parts)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        normalized_tag = tag.lower()
        if normalized_tag in SKIP_TAGS:
            self._skip_stack.append(normalized_tag)
            return

        if self._skip_stack:
            return

        if normalized_tag in BLOCK_SEPARATOR_TAGS:
            self._parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        normalized_tag = tag.lower()
        if self._skip_stack and self._skip_stack[-1] == normalized_tag:
            self._skip_stack.pop()
            return

        if self._skip_stack:
            return

        if normalized_tag in BLOCK_SEPARATOR_TAGS:
            self._parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip_stack:
            return

        cleaned = _normalize_inline_text(data)
        if cleaned:
            self._parts.append(cleaned)
            self._parts.append(" ")


def _normalize_inline_text(value: str) -> str:
    return WHITESPACE_PATTERN.sub(" ", unescape(value)).strip()


def _extract_title(html: str) -> str | None:
    match = TITLE_PATTERN.search(html)
    if not match:
        return None

    title = _normalize_inline_text(match.group(1))
    return title or None


def _cleanup_readable_text(text: str) -> str:
    lines = [_normalize_inline_text(line) for line in text.splitlines()]
    filtered_lines: list[str] = []

    previous_line: str | None = None
    for line in lines:
        if not line:
            continue
        if line == previous_line:
            continue
        filtered_lines.append(line)
        previous_line = line

    return "\n".join(filtered_lines).strip()


class ReadableContentExtractor:
    """Converts fetched page content into AI-ready readable text."""

    def extract(self, source_url: HttpUrl, html: str) -> ReadableContent:
        normalized_html = html.strip()
        if not normalized_html:
            raise ReadableContentError(
                "We could not find readable content on that page. Please paste the job description instead."
            )

        parser = _ReadableHTMLParser()
        parser.feed(COMMENT_PATTERN.sub(" ", normalized_html))
        parser.close()

        readable_text = _cleanup_readable_text(parser.text)
        if len(readable_text) < THIN_CONTENT_MIN_LENGTH:
            hostname = urlparse(str(source_url)).hostname or "this page"
            raise ReadableContentError(
                f"We could not find enough readable content on {hostname}. Please paste the job description instead."
            )

        return ReadableContent(
            source_url=source_url,
            title=_extract_title(normalized_html),
            readable_text=readable_text,
            content_type="text/html",
        )
