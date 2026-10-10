"""Dedicated Swahili NER inference server. Not intended for consequential decisions."""
import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline

MODEL_ID = os.getenv("MODEL_ID", "mbeukman/xlm-roberta-base-finetuned-ner-swahili")
SERVICE_TOKEN = os.getenv("SERVICE_TOKEN")
ner = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ner
    ner = pipeline("token-classification", model=MODEL_ID, aggregation_strategy="simple")
    yield
    ner = None

app = FastAPI(title="SwahiliLand Model Service", version="0.1.0", lifespan=lifespan)

class InferenceInput(BaseModel):
    inputs: str = Field(min_length=1, max_length=2000)

@app.get("/health")
def health():
    return {"status": "ready" if ner is not None else "loading", "model": MODEL_ID}

@app.post("/predict")
def predict(payload: InferenceInput, authorization: str | None = Header(default=None)):
    if not SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail="SERVICE_TOKEN not configured")
    if authorization != f"Bearer {SERVICE_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    if ner is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    start = time.perf_counter()
    results = ner(payload.inputs)
    return [
        {
            "word": item["word"],
            "entity_group": item["entity_group"],
            "score": float(item["score"]),
            "start": item.get("start"),
            "end": item.get("end"),
        }
        for item in results
    ]
