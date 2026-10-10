"""SwahiliLand research NER service. Never use for consequential decisions."""
import logging
import os
import time
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("swahililand")
MODEL_ID = os.getenv("MODEL_ID", "mbeukman/xlm-roberta-base-finetuned-ner-swahili")
SERVICE_TOKEN = os.getenv("SERVICE_TOKEN")
TORCH_THREADS = max(1, int(os.getenv("TORCH_THREADS", "2")))
ner = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ner
    torch.set_num_threads(TORCH_THREADS)
    started = time.perf_counter()
    logger.info("Loading model %s with %s CPU threads", MODEL_ID, TORCH_THREADS)
    ner = pipeline("token-classification", model=MODEL_ID, aggregation_strategy="simple", device=-1)
    # Warm the tokenizer/model before first user request, without retaining input text.
    with torch.inference_mode():
        ner("Nairobi iko nchini Kenya.")
    logger.info("Model ready; initialization took %.2fs", time.perf_counter() - started)
    yield
    ner = None


app = FastAPI(title="SwahiliLand Model Service", version="0.2.0", lifespan=lifespan)


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
    started = time.perf_counter()
    with torch.inference_mode():
        results = ner(payload.inputs)
    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info("Inference completed duration_ms=%s entity_count=%s input_chars=%s", elapsed_ms, len(results), len(payload.inputs))
    return [
        {"word": item["word"], "entity_group": item["entity_group"],
         "score": float(item["score"]), "start": item.get("start"), "end": item.get("end")}
        for item in results
    ]
