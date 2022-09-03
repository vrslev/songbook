import asyncio
import json
from typing import Any

from pydantic import BaseSettings

from backend.app.factory import DetaBaseSettings, init_song_store, init_user_store
from backend.core.store import Model, ModelNoKey, Store


class BackupSettings(BaseSettings):
    deta_base: DetaBaseSettings

    class Config:  # pyright: ignore[reportIncompatibleVariableOverride]
        env_nested_delimiter = "__"


async def backup_store(store: Store[Model, ModelNoKey]) -> list[dict[str, Any]]:
    return [item.dict() for item in await store.get_all()]


async def main():
    settings = BackupSettings(".env")  # pyright: ignore[reportGeneralTypeIssues]
    result = {
        "songs": await backup_store(init_song_store(settings.deta_base)),
        "users": await backup_store(init_user_store(settings.deta_base)),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
