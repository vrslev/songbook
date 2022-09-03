import asyncio

from pydantic import BaseSettings

from backend.app.main import state
from backend.app.routers.user import add_superuser


class SuperuserSettings(BaseSettings):
    username: str
    password: str

    class Config:  # pyright: ignore[reportIncompatibleVariableOverride]
        env_prefix = "SUPERUSER__"


async def main():
    superuser = SuperuserSettings(".env")  # type: ignore
    result = await add_superuser(
        username=superuser.username,
        password=superuser.password,
        user_store=state.user_store,
        pwd_context=state.pwd_context,
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
