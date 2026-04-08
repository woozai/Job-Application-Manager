from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    username: str = Field(
        ..., min_length=1, max_length=100, description="Unique username for the user"
    )
    email: EmailStr = Field(..., max_length=255, description="User's email address")


class UserCreate(UserBase):
    password: str = Field(
        ..., min_length=8, max_length=255, description="Password for the user account"
    )


class UserUpdate(BaseSchema):
    username: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Unique username for the user"
    )
    email: Optional[EmailStr] = Field(
        None, max_length=255, description="User's email address"
    )
    password: Optional[str] = Field(
        None, min_length=8, max_length=255, description="Password for the user account"
    )


class UserResponse(UserBase):
    id: int = Field(..., description="Unique identifier for the user")
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: datetime = Field(
        ..., description="Timestamp when the user was last updated"
    )
