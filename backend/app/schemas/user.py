from __future__ import annotations

from datetime import datetime
from typing import Optional

from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseSchema):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
