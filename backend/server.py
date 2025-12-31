from fastapi import FastAPI, APIRouter, HTTPException, status
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
# Environment variables (read lazily; validated at startup)
# -------------------------------------------------
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

# -------------------------------------------------
# App initialization
# -------------------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# -------------------------------------------------
# MongoDB (initialized lazily during startup)
# -------------------------------------------------
client = None
db = None

@app.on_event("startup")
async def startup():
    global client, db
    try:
        # re-read env vars at runtime (in case Render or other hosts set them)
        mongo_url = os.getenv("MONGO_URL")
        db_name = os.getenv("DB_NAME")
        if not mongo_url or not db_name:
            logging.error("Missing required environment variables: MONGO_URL and DB_NAME")
            raise RuntimeError("Missing required environment variables: MONGO_URL and DB_NAME")

        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]

        # perform a lightweight ping to validate connection during startup
        await client.admin.command("ping")
        app.state.db_initialized = True
        logging.info("MongoDB connection established and verified")
    except Exception as exc:
        logging.exception("Failed to initialize MongoDB during startup: %s", exc)
        # Re-raise so the process fails loudly and deploy logs show full traceback
        raise

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

@api_router.get("/health")
async def health():
    """Lightweight health check that pings MongoDB."""
    if client is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DB client not initialized")
    try:
        await client.admin.command("ping")
        return {"status": "ok"}
    except Exception as exc:
        logging.exception("Health check failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database ping failed")

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    """Create a status check; returns 503 if DB is unavailable or on write error."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not available")
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    try:
        await db.status_checks.insert_one(doc)
    except Exception as exc:
        logging.exception("Error writing status_check: %s", exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database error")
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    """Retrieve status checks; returns 503 if DB is unavailable or on read error."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not available")
    try:
        records = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    except Exception as exc:
        logging.exception("Error reading status_checks: %s", exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database error")
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
    try:
        if client:
            client.close()
    finally:
        app.state.db_initialized = False

# -------------------------------------------------
# Logging
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
