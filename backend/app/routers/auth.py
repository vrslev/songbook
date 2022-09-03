from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestFormStrict
from pydantic import BaseModel

from backend.app.dependencies import (
    get_current_user,
    get_pwd_context,
    get_token_context,
    get_user_store,
)
from backend.core.auth import PwdContext, TokenContext
from backend.core.user import User, UserStore


class Token(BaseModel):
    access_token: str
    token_type: Literal["bearer"]


router = APIRouter(prefix="/auth", tags=["auth"], responses={"401": {}})


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestFormStrict = Depends(),
    user_store: UserStore = Depends(get_user_store),
    pwd_context: PwdContext = Depends(get_pwd_context),
    token_context: TokenContext = Depends(get_token_context),
) -> Token:
    user = await user_store.query_one({"username": form.username})
    if user and pwd_context.verify(hash=user.hashed_password, password=form.password):
        access_token = token_context.create(username=user.username)
        return Token(access_token=access_token, token_type="bearer")

    # prevent timing attacks
    # https://github.com/tiangolo/fastapi/pull/2531
    pwd_context.verify(hash="", password=form.password)
    raise HTTPException(401, "Incorrect username or password")


@router.get("/me", response_model=User)
async def me(user: User = Depends(get_current_user)) -> User:
    return user
