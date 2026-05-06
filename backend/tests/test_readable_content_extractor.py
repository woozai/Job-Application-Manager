from __future__ import annotations

import pytest

from app.services.extraction.readable_content import ReadableContentExtractor
from app.services.extraction.types import ReadableContentError


def test_readable_content_extractor_strips_noise_and_keeps_main_text() -> None:
    extractor = ReadableContentExtractor()
    html = """
    <html>
      <head>
        <title>Senior Backend Engineer</title>
        <style>.hidden { display: none; }</style>
        <script>console.log('ignore me')</script>
      </head>
      <body>
        <header>Top navigation</header>
        <nav>Home Jobs Sign in</nav>
        <main>
          <article>
            <h1>Senior Backend Engineer</h1>
            <p>Build backend systems for a fast-growing product team.</p>
            <p>Required skills: Python, FastAPI, SQLAlchemy, APIs, testing.</p>
            <p>Location: Tel Aviv, Israel.</p>
          </article>
        </main>
        <footer>Privacy Terms Cookies</footer>
      </body>
    </html>
    """

    result = extractor.extract("https://example.com/jobs/123", html)

    assert result.title == "Senior Backend Engineer"
    assert "Build backend systems for a fast-growing product team." in result.readable_text
    assert "Required skills: Python, FastAPI, SQLAlchemy, APIs, testing." in result.readable_text
    assert "Top navigation" not in result.readable_text
    assert "Home Jobs Sign in" not in result.readable_text
    assert "ignore me" not in result.readable_text
    assert "Privacy Terms Cookies" not in result.readable_text


def test_readable_content_extractor_rejects_thin_content() -> None:
    extractor = ReadableContentExtractor()
    html = "<html><body><main><p>Apply now</p></main></body></html>"

    with pytest.raises(ReadableContentError, match="Please paste the job description instead"):
        extractor.extract("https://linkedin.com/jobs/view/123", html)
