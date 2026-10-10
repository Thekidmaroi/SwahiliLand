# SwahiliLand model-serving service

This FastAPI service loads `mbeukman/xlm-roberta-base-finetuned-ner-swahili` and exposes token-classification inference through a Docker-deployable HTTP API.

**Research/demo use only.** The model author's card warns against consequential production use and says that out-of-domain generalization has not been validated.

## Local run

```bash
cd model-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export SERVICE_TOKEN="replace-with-a-long-random-secret"
uvicorn app:app --host 127.0.0.1 --port 8000
```

First startup downloads model weights and can take time. CPU inference can be slow. Do not expose this development command publicly.

## Docker

```bash
docker build -t swahililand-model ./model-service
docker run --rm -p 127.0.0.1:8000:8000 -e SERVICE_TOKEN="replace-with-a-long-random-secret" swahililand-model
```

Smoke test:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Authorization: Bearer replace-with-a-long-random-secret" \
  -H "Content-Type: application/json" \
  -d '{"inputs":"Rais alitembelea Nairobi nchini Kenya."}'
```

For the Next.js application, configure `HF_INFERENCE_ENDPOINT=https://YOUR-SERVICE/predict` and `HF_TOKEN` to the same `SERVICE_TOKEN`. The variable names are historical; they also work with this custom service.

## Hosting

Deploy this container to a provider with enough RAM for XLM-RoBERTa and persistent model cache. Vercel only hosts the frontend and API proxy. Set the secret on both sides, configure HTTPS, and protect the service with provider-side rate limits. A public deployment has **not** been completed or tested.

## Model and license

Model: https://huggingface.co/mbeukman/xlm-roberta-base-finetuned-ner-swahili (Apache-2.0 per model card). Verify dataset licensing separately and retain attribution. The model card reports 88.71 F1 on its in-domain MasakhaNER test set; this is **not** a SwahiliLand benchmark.

## Next steps

- Pin dependencies and model revision for reproducible deployment
- Benchmark latency and model quality
- Add server-side request quotas and logging without storing input text
- Test deployment and end-to-end inference
