from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Job Application Manager API"
    database_url: str = "sqlite:///./job_applications.db"
    secret_key: SecretStr
    gemini_api_key: SecretStr | None = None
    gemini_model: str = "gemini-2.5-flash"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 14
    extraction_fetch_timeout_seconds: float = 10.0
    extraction_max_response_bytes: int = 1_000_000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# BaseSettings loads required values like SECRET_KEY from the environment at runtime.
settings = Settings()  # pyright: ignore[reportCallIssue]
