# SwahiliLand

**SwahiliLand** is a Swahili named-entity recognition (NER) web application with a validated Next.js inference API.

> **Status: starter foundation, not yet a deployed NLP service.** The frontend, API contract and CI are implemented. Live inference requires selecting and connecting a compatible Swahili NER model.

## Architecture

Browser (Next.js) → POST /api/predict (Vercel) → HTTPS dedicated model endpoint.

The model is **not** bundled into Vercel. The API validates input, keeps the provider token on the server, enforces an upstream timeout and normalizes model output.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000. Without configured inference credentials, the API returns HTTP 503 by design.

## Included inference service

A Dockerized FastAPI server is now available in [`model-service/`](model-service/README.md). It loads the Swahili-specific XLM-RoBERTa checkpoint, provides `/predict`, and returns the response expected by the Next.js proxy. This code has **not** yet been exercised against a live hosted model. The model card explicitly cautions against consequential production use; SwahiliLand is currently a research/demo application.

To connect it, deploy the container on a suitable host, configure its `SERVICE_TOKEN`, then set `HF_INFERENCE_ENDPOINT=https://YOUR-HOST/predict` and `HF_TOKEN` in Vercel to match. Do not put secrets in the browser.

## Model serving

Configure `HF_INFERENCE_ENDPOINT` with an HTTPS endpoint serving a verified Swahili token-classification model and `HF_TOKEN` with the secret token. The expected request body is `{"inputs":"Rais alitembelea Nairobi."}`. The expected provider response is a JSON array, for example:

```json
[{"word":"Nairobi","entity_group":"LOC","score":0.97,"start":17,"end":24}]
```

Verify the model's license, entity labels and endpoint format before use. No model has been selected or evaluated yet. Do not log user-submitted text or expose credentials in browser code.

## Candidate Swahili NER model

**Candidate:** [mbeukman/xlm-roberta-base-finetuned-ner-swahili](https://huggingface.co/mbeukman/xlm-roberta-base-finetuned-ner-swahili).

The model card describes an XLM-RoBERTa token-classification model fine-tuned on the Swahili portion of MasakhaNER. This is a **candidate**, not a confirmed live integration. Before deploying:

1. Confirm model and dataset licensing, plus any attribution obligations.
2. Verify its actual output shape and label schema with `pipeline("token-classification", aggregation_strategy="simple")`.
3. Deploy it on a dedicated HTTPS inference service, benchmark latency and quality, and configure `HF_INFERENCE_ENDPOINT` and `HF_TOKEN`.
4. Test the Vercel API end-to-end and add rate limiting before opening public traffic.

Do not substitute the high-resource-only `Davlan/xlm-roberta-base-ner-hrl` checkpoint as if it were Swahili-specific: its documented training languages exclude Swahili.

## API contract

`POST /api/predict` with `{"text":"Rais alitembelea Nairobi nchini Kenya."}`

- HTTP 200: `{"language":"sw","task":"named-entity-recognition","entities":[...],"latencyMs":123}`
- HTTP 400: invalid input
- HTTP 503: missing or invalid inference configuration
- HTTP 502: upstream inference failure

## Quality

```bash
npm run lint
npm test
npm run build
```

CI runs these checks for pull requests. Current tests validate contracts, **not** NLP model accuracy.

## Deploy to Vercel

Import the repository as a Next.js project, configure `HF_INFERENCE_ENDPOINT` and `HF_TOKEN` as server-side environment variables, deploy, and verify a real inference request. Add rate limiting, usage quotas and model evaluation before opening the service publicly.

## Roadmap

- [x] Next.js frontend and inference API contract
- [x] Input validation and timeout handling
- [x] Unit tests and GitHub Actions CI
- [ ] Select licensed Swahili NER model and evaluation dataset
- [x] Implement Dockerized Python model-serving service (not yet deployed)\n- [ ] Configure and verify live model inference
- [ ] Benchmark F1, latency and error cases
- [ ] Add rate limiting, observability and deployment smoke tests
- [ ] Publish Vercel deployment

License to be finalized after checking third-party model and dataset terms.
