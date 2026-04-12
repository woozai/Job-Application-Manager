from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import (
    CurrentUser,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    RefreshTokenRequest,
    Token,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.user import (
    authenticate_user,
    create_user,
    delete_user,
    get_user,
    get_user_by_email,
    get_user_by_username,
    update_user,
)

router = APIRouter(prefix="/users", tags=["users"])


def create_session_tokens(user: User) -> Token:
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes),
    )
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/", response_model=UserResponse)
async def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)) -> User:
    if get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user)


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_session_tokens(user)


@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> Token:
    user_id = verify_refresh_token(refresh_request.refresh_token)
    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = get_user(db, user_id=user_id_int)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_session_tokens(user)


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: CurrentUser) -> User:
    return current_user


@router.get("/", response_model=list[UserResponse])
async def read_users(
    current_user: CurrentUser,
) -> list[User]:
    return [current_user]


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, current_user: CurrentUser) -> User:
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user")

    return current_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: int,
    user: UserUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> User:
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    if user.username is not None:
        existing_user = get_user_by_username(db, username=user.username)
        if existing_user is not None and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Username already exists")

    if user.email is not None:
        existing_email = get_user_by_email(db, email=user.email)
        if existing_email is not None and existing_email.id != user_id:
            raise HTTPException(status_code=400, detail="Email already registered")

    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = update_user(db, user_id=user_id, user_update=user)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.delete("/{user_id}")
async def delete_user_endpoint(
    user_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    success = delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
