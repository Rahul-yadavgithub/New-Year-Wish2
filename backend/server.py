from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from pathlib import Path
from datetime import datetime, timezone
import os
import uuid
import logging
from dotenv import load_dotenv

# -------------------------------------------------
# Load environment variables (local only)
# -------------------------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -------------------------------------------------
# Validate environment variables SAFELY
# -------------------------------------------------
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL is not set")

if not DB_NAME:
    raise RuntimeError("DB_NAME is not set")

# -------------------------------------------------
# App initialization
# -------------------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# -------------------------------------------------
# MongoDB (initialized safely)
# -------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# -------------------------------------------------
# Models
# -------------------------------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str

# -------------------------------------------------
# Routes
# -------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status = StatusCheck(**input.model_dump())
    doc = status.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    records = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in records:
        r["timestamp"] = datetime.fromisoformat(r["timestamp"])
    return records

# -------------------------------------------------
# Middleware
# -------------------------------------------------
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Router registration
# -------------------------------------------------
app.include_router(api_router)

# -------------------------------------------------
# Shutdown cleanup
# -------------------------------------------------
@app.on_event("shutdown")
async def shutdown():
    client.close()

# -------------------------------------------------
# Logging
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
