from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from pydantic import BaseModel, ValidationError


@dataclass
class PwdContext:
    crypt_context: CryptContext

    def hash(self, password: str) -> str:
        return self.crypt_context.hash(secret=password)  # pyright: ignore

    def verify(self, hash: str, password: str) -> bool:
        try:
            return self.crypt_context.verify(  # pyright: ignore
                secret=password, hash=hash
            )
        except UnknownHashError:
            return False


class _TokenData(BaseModel):
    sub: str
    exp: datetime


class TokenContext(BaseModel):
    secret_key: str
    expires: timedelta
    algorithm: str

    def create(self, username: str) -> str:
        data = _TokenData(sub=username, exp=datetime.utcnow() + self.expires)
        return jwt.encode(  # pyright: ignore
            claims=data.dict(),
            key=self.secret_key,
            algorithm=self.algorithm,
        )

    def decode(self, token: str) -> str | None:
        try:
            data: dict[str, Any] = jwt.decode(  # pyright: ignore
                token=token, key=self.secret_key, algorithms=[self.algorithm]
            )
        except JWTError:
            return

        try:
            return _TokenData(**data).sub
        except ValidationError:
            return
