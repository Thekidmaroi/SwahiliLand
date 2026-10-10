FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HOME=/opt/hf-cache
WORKDIR /app
COPY model-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY model-service/app.py ./app.py
RUN useradd -m -u 10001 appuser && mkdir -p /opt/hf-cache && chown -R appuser:appuser /opt/hf-cache
USER appuser
EXPOSE 7860
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]
