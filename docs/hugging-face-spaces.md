# Deploy SwahiliLand model server on Hugging Face Spaces

This is a **manual deployment guide**; no Hugging Face Space has been created yet.

1. Sign in at https://huggingface.co/new-space and create a new Space named `SwahiliLand-NER`.
2. Select **Docker** as the Space SDK. Set the Space README YAML metadata to:

```yaml
---
title: SwahiliLand NER
emoji: 🌍
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
---
```

3. Copy **all files** from the GitHub `model-service/` directory to the **root** of the Space repository. Use the Space README metadata above rather than copying this deployment guide as the root README.
4. In Space **Settings → Variables and secrets**, add a secret `SERVICE_TOKEN` with a strong random value. Do not commit it to Git.
5. Start the Space and inspect the build logs. Model weights are downloaded during startup. A free CPU tier may be too slow or too memory-constrained for XLM-RoBERTa; upgrade hardware if the Space fails to load.
6. Test `https://YOUR-USERNAME-SWAHILILAND-NER.hf.space/health` and confirm it reports `ready`.
7. Send a test POST to `https://YOUR-USERNAME-SWAHILILAND-NER.hf.space/predict` with `Authorization: Bearer <SERVICE_TOKEN>` and JSON body `{"inputs":"Rais alitembelea Nairobi nchini Kenya."}`.
8. In Vercel, set server-only environment variables:
   - `HF_INFERENCE_ENDPOINT=https://YOUR-USERNAME-SWAHILILAND-NER.hf.space/predict`
   - `HF_TOKEN=<same secret as SERVICE_TOKEN>`

**Security:** A public Space URL does not make the inference route public: the token is required. Add rate limits, usage quotas and monitoring before promoting a demo. A sleeping Space may take longer to cold-start than the 20-second proxy timeout; consider paid always-on hosting or an asynchronous job flow if necessary.

**Note:** The Space service is a demonstration of research model serving, not a validated production NLP system.
