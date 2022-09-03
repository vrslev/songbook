from typing import Any
from uuid import UUID

import pytest
from _pytest.fixtures import SubRequest
from pydantic import BaseModel

from backend.core.store import DictStore, Store


class ProductNoKey(BaseModel):
    name: str
    price: float


class Product(ProductNoKey):
    key: str


@pytest.fixture(params=[DictStore[Any, Any]])
def store(request: SubRequest):
    return request.param(model=Product, model_no_key=ProductNoKey)


@pytest.fixture
def product():
    return ProductNoKey(name="Labeler", price=99.9)


ProductStore = Store[Product, ProductNoKey]


async def test_store_get_ok(store: ProductStore, product: ProductNoKey):
    added = await store.add(product)
    assert store.model_no_key.parse_obj(added) == product
    assert await store.get(added.key) == added


async def test_store_get_not_found(store: ProductStore):
    assert await store.get("whatever") is None


async def test_store_get_all(store: ProductStore, product: ProductNoKey):
    added = [await store.add(product) for _ in range(10)]
    assert await store.get_all() == added


async def test_store_add(store: ProductStore, product: ProductNoKey):
    assert isinstance(product, ProductNoKey)
    added = await store.add(product)
    assert isinstance(added, store.model)
    UUID(added.key)


async def test_store_update_ok(store: ProductStore, product: ProductNoKey):
    added = await store.add(product)

    updated_no_key = product.copy()
    updated_no_key.name = "Not a labeler"
    updated = await store.update(key=added.key, value=updated_no_key)

    assert store.model_no_key.parse_obj(updated) == updated_no_key
    assert await store.get_all() == [updated]


async def test_store_update_not_found(store: ProductStore, product: ProductNoKey):
    assert await store.update(key="whatever", value=product) is None


async def test_store_delete_not_exists(store: ProductStore):
    assert await store.delete("whatever") is None


async def test_store_delete_exists(store: ProductStore, product: ProductNoKey):
    added = await store.add(product)
    assert await store.delete(added.key) is None
    assert await store.get_all() == []


async def test_store_query(store: ProductStore, product: ProductNoKey):
    added_labelers = [await store.add(product) for _ in range(10)]
    added_not_labeler = await store.add(ProductNoKey(name="Not a labeler", price=999))

    assert await store.query({"name": product.name, "whaaat": None}) == added_labelers
    assert await store.query(product.dict()) == added_labelers

    assert not await store.query({"name": product.name.lower()})
    assert not await store.query(
        {
            "name": product.name,
            "price": product.price + 10,
        }
    )

    assert await store.query(added_not_labeler.dict()) == [added_not_labeler]
    assert await store.query({"key": added_not_labeler.key}) == [added_not_labeler]
