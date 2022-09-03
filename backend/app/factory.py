from datetime import timedelta
from typing import Optional

import secure
import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.routing import APIRoute
from passlib.context import CryptContext
from pydantic import BaseModel, BaseSettings
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from backend.app.dependencies import CustomState
from backend.app.middleware import SecureHeadersMiddleware
from backend.app.routers import auth, song, user
from backend.core.auth import PwdContext, TokenContext
from backend.core.song import Song, SongNoKey, SongStore
from backend.core.store import DetaBaseStore, DictStore
from backend.core.user import StoreUser, StoreUserNoKey, UserStore


class DetaBaseSettings(BaseModel):
    project_key: str
    project_id: str
    song_db_name: str
    user_db_name: str


class TokenSettings(BaseModel):
    secret_key: str
    expires: timedelta = timedelta(days=30)
    algorithm: str = "HS256"


class Settings(BaseSettings):
    debug: bool = False
    deta_base: Optional[DetaBaseSettings] = None
    token: TokenSettings
    sentry_dsn: Optional[str] = None

    class Config:  # pyright: ignore[reportIncompatibleVariableOverride]
        env_nested_delimiter = "__"


def init_user_store(settings: Optional[DetaBaseSettings]) -> UserStore:
    if not settings:
        return DictStore(model=StoreUser, model_no_key=StoreUserNoKey)
    return DetaBaseStore(
        model=StoreUser,
        model_no_key=StoreUserNoKey,
        base_name=settings.user_db_name,
        project_key=settings.project_key,
        project_id=settings.project_id,
    )


def init_song_store(settings: Optional[DetaBaseSettings]) -> SongStore:
    if not settings:
        return DictStore(model=Song, model_no_key=SongNoKey)
    return DetaBaseStore(
        model=Song,
        model_no_key=SongNoKey,
        base_name=settings.song_db_name,
        project_key=settings.project_key,
        project_id=settings.project_id,
    )


def make_state_from_settings(settings: Settings) -> CustomState:
    pwd_context = PwdContext(crypt_context=CryptContext(["bcrypt"]))
    token_context = TokenContext(
        secret_key=settings.token.secret_key,
        expires=settings.token.expires,
        algorithm=settings.token.algorithm,
    )
    user_store = init_user_store(settings.deta_base)
    song_store = init_song_store(settings.deta_base)
    return CustomState(
        pwd_context=pwd_context,
        token_context=token_context,
        user_store=user_store,
        song_store=song_store,
    )


def generate_openapi_unique_id(route: APIRoute):
    return f"{route.tags[0]}-{route.name}"


def get_app(state: CustomState, debug: bool, sentry_dsn: Optional[str]) -> FastAPI:
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[StarletteIntegration(), FastApiIntegration()],
        )

    openapi_url = "/openapi.json" if debug else None

    headers = secure.Secure(server=secure.Server(), xfo=secure.XFrameOptions().deny())
    middleware: list[Middleware] = [
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
        Middleware(SecureHeadersMiddleware, headers=headers),
        Middleware(GZipMiddleware, minimum_size=1000),
    ]

    app = FastAPI(
        debug=debug,
        middleware=middleware,
        openapi_url=openapi_url,
        generate_unique_id_function=generate_openapi_unique_id,
    )
    app.include_router(auth.router)
    app.include_router(user.router)
    app.include_router(song.router)

    app.state.custom_state = state

    return app
