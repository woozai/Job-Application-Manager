from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field, BaseModel


class UserBase(BaseModel):
    username: str = Field(
        ..., min_length=1, max_length=100, description="Unique username for the user"
    )
    email: EmailStr = Field(..., max_length=255, description="User's email address")


class UserCreate(UserBase):
    password: str = Field(
        ..., min_length=8, max_length=255, description="Password for the user account"
    )


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


class UserResponse(UserBase):
    id: int = Field(..., description="Unique identifier for the user")
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: datetime = Field(
        ..., description="Timestamp when the user was last updated"
    )


class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type")
