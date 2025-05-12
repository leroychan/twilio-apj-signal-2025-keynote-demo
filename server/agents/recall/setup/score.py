import json
import os
from typing import List

import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel

# --------------------------------------------------
# Azure Embedding Model Scoring Script
# --------------------------------------------------

tokenizer: AutoTokenizer | None = None
model: AutoModel | None = None


def init():
    """Load the text‑embedding model once per replica."""
    global tokenizer, model

    # Azure automatically mounts the registered model under this env var
    model_dir = os.getenv("AZUREML_MODEL_DIR")
    # Fallback to hub name if you deploy straight from HuggingFace
    model_name = os.getenv("MODEL_NAME", "text-embedding-3-large")

    tokenizer = AutoTokenizer.from_pretrained(model_dir or model_name)
    model = AutoModel.from_pretrained(model_dir or model_name)
    model.eval()


def _embed(texts: List[str]) -> list[list[float]]:
    """Return L2‑normalised embeddings for *texts* (list of strings)."""
    if tokenizer is None or model is None:
        raise RuntimeError("Model not initialised – did Azure call init()?")

    inputs = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=8192,
        return_tensors="pt",
    )

    with torch.no_grad():
        # [batch, seq, hidden]
        hidden = model(**inputs).last_hidden_state
        # Mean‑pool over tokens → [batch, hidden]
        emb = hidden.mean(dim=1)

    # L2‑normalise so dot‑product == cosine similarity
    emb = torch.nn.functional.normalize(emb, p=2, dim=1)
    return emb.cpu().numpy().tolist()


# ---------------------------------------------------------------------------
# Azure will call run() for every request. Input must be JSON with either:
#   {"text": "single string"}          → returns {"embedding": [...]}
#   {"texts": ["t1", "t2", ...]}      → returns {"embeddings": [[...], ...]}
# ---------------------------------------------------------------------------

def run(raw_data):
    try:
        data = json.loads(raw_data)

        # single text → "embedding"
        if "text" in data:
            vec = _embed([data["text"]])[0]
            return {"embedding": vec}

        # batch → "embeddings"
        if "texts" in data:
            vecs = _embed(list(map(str, data["texts"])))
            return {"embeddings": vecs}

        return {"error": "Payload must contain 'text' or 'texts'."}

    except Exception as e:
        # Return the error so the caller can inspect
        return {"error": str(e)}
