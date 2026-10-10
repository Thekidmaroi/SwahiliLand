# SwahiliLand · Swahili Named Entity Recognition

A full-stack, open-source **Kiswahili named entity recognition playground**. Explore people, locations and organizations in a sentence using an XLM-RoBERTa model behind a dedicated Python inference API.

**Live demo:** [SwahiliLand on Vercel](https://swahililand-marwanehoundel-gmailcoms-projects.vercel.app) · **Source:** [GitHub](https://github.com/Thekidmaroi/SwahiliLand)

> Research/portfolio demonstration, **not** a system for consequential decisions. Model predictions may be incorrect or biased.

## What you can do

- Enter up to 2,000 characters of Swahili and run entity recognition.
- Try example sentences with a single click.
- Inspect inline entity highlights, labels, scores and measured end-to-end inference latency.
- Explore an accessible, responsive interface with loading, error and empty states.

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Web | Next.js 15, React 19, TypeScript | Interactive playground |
| API proxy | Next.js Route Handler + Zod | Input validation, secure proxy, timeout |
| Model server | FastAPI, Uvicorn, PyTorch, Transformers | Dedicated inference process |
| Model | [XLM-RoBERTa fine-tuned for Swahili NER](https://huggingface.co/mbeukman/xlm-roberta-base-finetuned-ner-swahili) | Token classification |
| Hosting | Vercel + Railway | Web + CPU inference |
| Quality | Vitest, ESLint, GitHub Actions | Contract tests and CI |

## Architecture

```text
Browser ── POST /api/predict ──> Next.js / Vercel
                                    │ HTTPS + server-only Bearer token
                                    ▼
                             FastAPI / Railway
                                    │
                                    ▼
                          XLM-RoBERTa / PyTorch CPU
                                    │
                  Entity offsets, labels and scores
                                    ▼
                         Inline highlighted entities
```

See [architecture, security, benchmarking and evaluation notes](docs/architecture.md).

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `HF_INFERENCE_ENDPOINT` to the HTTPS URL of your model server's `/predict` endpoint, and `HF_TOKEN` to the same secret configured as `SERVICE_TOKEN` on the Python server. **Never expose secrets as `NEXT_PUBLIC_*` variables.**

To run the Python server, see [model-service/README.md](model-service/README.md). To deploy it with Hugging Face Spaces, see [the deployment guide](docs/hugging-face-spaces.md).

## API

`POST /api/predict`:

```json
{"text":"Barack Obama alitembelea Nairobi nchini Kenya."}
```

Successful response:

```json
{
  "language": "sw",
  "task": "named-entity-recognition",
  "entities": [{"text":"Nairobi","label":"LOC","score":0.97,"start":26,"end":33}],
  "latencyMs": 420
}
```

The values above illustrate the **response shape**, not a verified model prediction or benchmark. The server returns HTTP 400 for invalid input, 503 for missing configuration, 502 for upstream errors, and 504 for timeouts.

## Test and build

```bash
npm run lint
npm test
npm run build
```

Unit tests cover validation, provider response normalization, entity offsets, overlaps and invalid spans. CI runs checks on pull requests. Model accuracy and production load testing are **not yet measured**.

## Performance choices

- Load model once per Python worker; warm it up at startup.
- Use `torch.inference_mode()` and configurable CPU thread count (`TORCH_THREADS=2`).
- Keep only one Uvicorn worker by default to avoid duplicate model memory.
- Avoid persisting or logging submitted text.
- Show real request latency in the UI instead of invented benchmark numbers.

**Next engineering milestones:** measure p50/p95 on representative inputs, evaluate entity-level F1 on a licensed held-out dataset, add rate limiting and a deployment smoke-test workflow.

## Portfolio / design

The interface is intentionally designed as a focused NLP laboratory: emerald accents, dark surfaces, responsive annotated text, example prompts and per-entity confidence. Add a verified screenshot to `docs/screenshots/` after deployment; screenshots are not fabricated in this repository.

## License and model use

The candidate model's [model card](https://huggingface.co/mbeukman/xlm-roberta-base-finetuned-ner-swahili) documents model terms and limitations. Verify model and dataset licensing before redistribution. The repository's own license is not yet finalized.
