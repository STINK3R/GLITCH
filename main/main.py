import logging

from fastapi import FastAPI

from main.db.db import init_db
from users.routers import auth

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan, root_path="/api")

app.include_router(auth.router)


@app.get("/health")
async def root():
    return {"message": "FastAPI Auth API",
            "status": "healthy"}
