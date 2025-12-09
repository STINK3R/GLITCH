import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/health")
async def root():
    return {"message": "FastAPI Auth API",
            "status": "healthy"}
