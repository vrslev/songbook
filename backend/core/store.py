from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol, TypeVar

import httpx
from pydantic import BaseModel

Model = TypeVar("Model", bound=BaseModel)
ModelNoKey = TypeVar("ModelNoKey", bound=BaseModel)


class Store(Protocol[Model, ModelNoKey]):
    model: type[Model]
    model_no_key: type[ModelNoKey]

    async def get(self, key: str) -> Model | None:  # pragma: no cover
        ...

    async def get_all(self) -> list[Model]:  # pragma: no cover
        ...

    async def add(self, value: ModelNoKey) -> Model:  # pragma: no cover
        ...

    async def update(
        self, key: str, value: ModelNoKey
    ) -> Model | None:  # pragma: no cover
        ...

    async def delete(self, key: str) -> None:  # pragma: no cover
        ...

    async def query(self, filters: dict[str, Any]) -> list[Model]:  # pragma: no cover
        ...

    async def query_one(self, filters: dict[str, Any]) -> Model | None:
        results = await self.query(filters)
        if results:
            return results[0]

    def _model_no_key_to_model(self, key: str, value: ModelNoKey) -> Model:
        return self.model(key=key, **value.dict())


@dataclass
class _StoreWithAttrs(Store[Model, ModelNoKey], Protocol):
    model: type[Model] = field()
    model_no_key: type[ModelNoKey] = field()


@dataclass
class DictStore(_StoreWithAttrs[Model, ModelNoKey]):
    data: dict[str, Model] = field(init=False, default_factory=dict)

    async def get(self, key: str) -> Model | None:
        if value := self.data.get(key):
            return value

    async def get_all(self) -> list[Model]:
        return list(self.data.values())

    async def add(self, value: ModelNoKey) -> Model:
        key = str(uuid.uuid4())
        added = self._model_no_key_to_model(key=key, value=value)
        self.data[key] = added
        return added

    async def update(self, key: str, value: ModelNoKey) -> Model | None:
        if key not in self.data:
            return
        updated = self._model_no_key_to_model(key=key, value=value)
        self.data[key] = updated
        return updated

    async def delete(self, key: str) -> None:
        if key in self.data:
            del self.data[key]

    async def query(self, filters: dict[str, Any]) -> list[Model]:
        def cond(entry: Model) -> bool:
            return all(getattr(entry, k, None) == v for k, v in filters.items())

        return [entry for entry in self.data.values() if cond(entry)]


@dataclass
class DetaBaseStore(_StoreWithAttrs[Model, ModelNoKey]):
    base_name: str
    project_key: str
    project_id: str
    client: Callable[[], httpx.AsyncClient] = field(init=False)

    # pyright: reportUnknownMemberType=false

    def __post_init__(self) -> None:
        self.client = lambda: httpx.AsyncClient(
            base_url=f"https://database.deta.sh/v1/{self.project_id}/{self.base_name}",
            headers={
                "Content-type": "application/json",
                "X-API-Key": self.project_key,
            },
        )

    async def get(self, key: str) -> Model | None:
        async with self.client() as client:
            response = await client.get(f"/items/{key}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return self.model(**response.json())

    async def get_all(self) -> list[Model]:
        async with self.client() as client:
            response = await client.post("/query")
        response.raise_for_status()
        return [self.model(**entry) for entry in response.json()["items"]]

    async def add(self, value: ModelNoKey) -> Model:
        async with self.client() as client:
            response = await client.put("/items", json={"items": [value.dict()]})
        response.raise_for_status()
        item = response.json()["processed"]["items"][0]
        return self.model(**item)

    async def update(self, key: str, value: ModelNoKey) -> Model | None:
        new_value = self._model_no_key_to_model(key, value)

        async with self.client() as client:
            response = await client.patch(
                f"/items/{key}", json={"set": new_value.dict()}
            )
        if response.status_code == 404:
            return None
        response.raise_for_status()

        return new_value

    async def delete(self, key: str) -> None:
        async with self.client() as client:
            response = await client.delete(f"/items/{key}")
        response.raise_for_status()

    async def query(self, filters: dict[str, Any]) -> list[Model]:
        async with self.client() as client:
            response = await client.post("/query", json={"query": [filters]})
        response.raise_for_status()
        return [self.model(**entry) for entry in response.json()["items"]]
