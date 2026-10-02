"""CodeBot API entry point.

Run locally with:

    uvicorn app.main:app --reload

This module is responsible for four things only: creating the application,
configuring CORS, connecting to and disconnecting from MongoDB around the
server's lifetime, and registering routers. Everything else lives in app/api.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from app import __version__
from app.api.routes import auth, codebot, health, history, users
from app.core.config import settings
from app.core.database import close_database, connect_to_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("codebot")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage resources for the whole life of the process.

    The database connection is opened once when the server starts and closed
    once when it stops, instead of on every request.
    """
    await connect_to_database()
    yield
    await close_database()


app = FastAPI(
    title=settings.APP_NAME,
    version=__version__,
    description=(
        "AI coding assistant API. Paste code, choose an operation, "
        "receive a structured result."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(PyMongoError)
async def database_exception_handler(
    request: Request, exc: PyMongoError
) -> JSONResponse:
    """Report a database outage as such, without leaking the connection string.

    A raw PyMongo error carries the URI, which contains credentials. It is
    logged internally and replaced with a safe message for the client.
    """
    logger.exception(
        "Database error while processing %s %s", request.method, request.url.path
    )
    return JSONResponse(
        status_code=503,
        content={"detail": "The database is temporarily unavailable. Please try again."},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Turn any unexpected crash into a safe, generic response.

    The real error is logged on the server where it belongs. The client only
    learns that something went wrong, never the internals.
    """
    logger.exception("Unhandled error while processing %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(codebot.router, prefix=settings.API_V1_PREFIX)
app.include_router(history.router, prefix=settings.API_V1_PREFIX)