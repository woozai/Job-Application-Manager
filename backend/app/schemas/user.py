from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.validators import validate_optional_text, validate_required_text


class UserBase(BaseModel):
    username: str = Field(
        ..., min_length=1, max_length=100, description="Unique username for the user"
    )
    email: EmailStr = Field(..., max_length=255, description="User's email address")

    @field_validator("username", mode="before")
    @classmethod
    def validate_username(cls, value: object) -> str:
        return validate_required_text(value, field_name="Username")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> str:
        normalized_email = validate_required_text(value, field_name="Email")
        return normalized_email.lower()


class UserCreate(UserBase):
    password: str = Field(
        ..., min_length=8, max_length=255, description="Password for the user account"
    )

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Password must be a string")
        if any(ord(character) < 32 for character in value):
            raise ValueError("Password contains unsupported control characters")
        return value


class UserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Unique username for the user",
    )
    email: EmailStr | None = Field(
        default=None, max_length=120, description="User's email address"
    )

    @field_validator("username", mode="before")
    @classmethod
    def validate_optional_username(cls, value: object) -> str | None:
        return validate_optional_text(value, field_name="Username")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_optional_email(cls, value: object) -> str | None:
        normalized_email = validate_optional_text(value, field_name="Email")
        return normalized_email.lower() if normalized_email is not None else None


class UserResponse(UserBase):
    id: int = Field(..., description="Unique identifier for the user")
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: datetime = Field(
        ..., description="Timestamp when the user was last updated"
    )


class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(..., description="Token type")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1, description="JWT refresh token")
