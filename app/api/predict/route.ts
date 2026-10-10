import { NextResponse } from 'next/server';
import { inputSchema, normalizeEntities } from '@/lib/ner';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = inputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Text must be between 1 and 2000 characters' }, { status: 400 });
  }

  const endpoint = process.env.HF_INFERENCE_ENDPOINT;
  const token = process.env.HF_TOKEN;
  if (!endpoint || !token) {
    return NextResponse.json({ error: 'Inference service is not configured' }, { status: 503 });
  }
  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== 'https:') throw new Error('HTTPS required');
  } catch {
    return NextResponse.json({ error: 'Inference endpoint configuration is invalid' }, { status: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: parsed.data.text }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Inference provider unavailable' }, { status: 502 });
    }
    const entities = normalizeEntities(await response.json());
    return NextResponse.json({
      language: 'sw',
      task: 'named-entity-recognition',
      entities,
      latencyMs: Math.round(performance.now() - started),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Inference failed or returned an unsupported format' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
