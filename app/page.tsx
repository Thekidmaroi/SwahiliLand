'use client';
import { useState } from 'react';
type Entity = { text: string; label: string; score: number; start: number | null; end: number | null };
export default function Home() {
  const [text, setText] = useState('Rais alitembelea Nairobi nchini Kenya.');
  const [entities, setEntities] = useState<Entity[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function analyze() {
    setLoading(true); setError(''); setEntities(null); setLatency(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Analysis failed');
      setEntities(result.entities); setLatency(result.latencyMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally { setLoading(false); }
  }
  return <main className="shell">
    <header><span className="eyebrow">AFRICAN LANGUAGE TECHNOLOGY</span><h1>Swahili<span>Land</span></h1>
      <p>Explore named entities in Kiswahili with a Transformer-powered NLP service.</p></header>
    <section className="panel">
      <label htmlFor="text">Swahili text</label>
      <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={6} />
      <div className="actions"><span>{text.length}/2000 characters</span><button disabled={loading || !text.trim()} onClick={analyze}>{loading ? 'Analyzing…' : 'Analyze text →'}</button></div>
    </section>
    <section className="panel results" aria-live="polite"><h2>Named entities</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {entities && <><p>{entities.length} entities detected · {latency} ms</p><div className="chips">{entities.map((e,i)=><div className="chip" key={i}><strong>{e.text}</strong><span>{e.label} · {(e.score*100).toFixed(1)}%</span></div>)}</div>{entities.length===0 && <p>No entities detected.</p>}</>}
      {!entities && !error && <p>Submit a sentence to see the model output. A configured inference endpoint is required.</p>}
    </section>
    <footer>SwahiliLand · Applied NLP engineering · <a href="https://github.com/Thekidmaroi/SwahiliLand">GitHub</a></footer>
  </main>;
}
