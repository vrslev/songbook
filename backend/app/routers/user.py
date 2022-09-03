from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from backend.app.dependencies import (
    get_current_superuser,
    get_pwd_context,
    get_user_store,
)
from backend.core.auth import PwdContext
from backend.core.user import (
    StoreUser,
    StoreUserNoKey,
    User,
    UserStore,
    get_user_with_updated_password,
)

NoneIfConflict = Optional


async def add_user(
    username: str,
    password: str,
    is_superuser: bool,
    user_store: UserStore,
    pwd_context: PwdContext,
) -> NoneIfConflict[StoreUser]:
    if await user_store.query({"username": username}):
        return

    hash = pwd_context.hash(password)
    to_add = StoreUserNoKey(
        is_superuser=is_superuser, username=username, hashed_password=hash
    )
    return await user_store.add(to_add)


async def add_superuser(
    username: str, password: str, user_store: UserStore, pwd_context: PwdContext
) -> None:
    result = await add_user(
        username=username,
        password=password,
        is_superuser=True,
        user_store=user_store,
        pwd_context=pwd_context,
    )
    if not result:
        raise Exception("Superuser with provided credentials already exists")


router = APIRouter(
    prefix="/user",
    tags=["user"],
    dependencies=[Depends(get_current_superuser)],
    responses={401: {}, 403: {}},
)


@router.get("/", response_model=list[User])
async def all(user_store: UserStore = Depends(get_user_store)) -> list[StoreUser]:
    return await user_store.get_all()


class UserAdd(BaseModel):
    username: str
    password: str


@router.post("", response_model=User, status_code=201, responses={409: {}})
async def add(
    user: UserAdd,
    user_store: UserStore = Depends(get_user_store),
    pwd_context: PwdContext = Depends(get_pwd_context),
) -> User:
    if result := await add_user(
        username=user.username,
        password=user.password,
        is_superuser=False,
        user_store=user_store,
        pwd_context=pwd_context,
    ):
        return result
    raise HTTPException(
        status.HTTP_409_CONFLICT, "User with requested username already exists"
    )


class UserUpdatePasswordBody(BaseModel):
    password: str


@router.patch("/{username}", response_model=User, responses={404: {}})
async def update_password(
    username: str,
    body: UserUpdatePasswordBody,
    user_store: UserStore = Depends(get_user_store),
    pwd_context: PwdContext = Depends(get_pwd_context),
) -> User:
    if user := await user_store.query_one({"username": username}):
        hash = pwd_context.hash(body.password)
        new = get_user_with_updated_password(user=user, new_hashed_password=hash)
        if updated := await user_store.update(key=user.key, value=new):
            return User.parse_obj(updated)
    raise HTTPException(404, detail="User not found")


@router.delete("/{username}", response_model=None, status_code=204)
async def delete(
    username: str, user_store: UserStore = Depends(get_user_store)
) -> None:
    if user := await user_store.query_one({"username": username}):
        return await user_store.delete(user.key)
