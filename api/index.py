"""Backend wrapper for Vercel"""
import asyncio

from fastapi import FastAPI

import backend.app.main
from backend.add_superuser import main as add_superuser
from backend.app.main import settings

if not settings.deta_base:
    asyncio.run(add_superuser())

app = FastAPI(docs_url=None)
app.mount("/api", backend.app.main.app)
