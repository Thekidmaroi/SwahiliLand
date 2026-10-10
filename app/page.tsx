'use client';
import { useState } from 'react';
import { segmentEntities, type Entity } from '@/lib/ner';

const examples = [
  { title: 'People & places', text: 'Barack Obama alitembelea Nairobi nchini Kenya.' },
  { title: 'Organizations', text: 'Shirika la Umoja wa Mataifa linafanya kazi nchini Tanzania.' },
  { title: 'Travel', text: 'Amina alisafiri kutoka Dar es Salaam kwenda Mombasa.' },
];
const categories: Record<string, string> = { PER: 'Person', PERSON: 'Person', LOC: 'Location', LOCATION: 'Location', ORG: 'Organization', ORGANIZATION: 'Organization', DATE: 'Date', MISC: 'Other' };
const labelClass = (label: string) => /^(PER|PERSON)$/.test(label) ? 'person' : /^(LOC|LOCATION)$/.test(label) ? 'location' : /^(ORG|ORGANIZATION)$/.test(label) ? 'organization' : 'other';
export default function Home() {
  const [text, setText] = useState(examples[0].text);
  const [submittedText, setSubmittedText] = useState('');
  const [entities, setEntities] = useState<Entity[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function analyze() {
    if (loading || !text.trim()) return;
    setLoading(true); setError(''); setEntities(null); setLatency(null);
    const current = text;
    try {
      const response = await fetch('/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: current }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Analysis failed');
      setSubmittedText(current); setEntities(result.entities); setLatency(result.latencyMs);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unexpected error'); }
    finally { setLoading(false); }
  }
  return <main className="shell">
    <nav className="topbar"><a className="wordmark" href="/" aria-label="SwahiliLand home"><span className="brand-dot" /> SwahiliLand</a><a className="navlink" href="https://github.com/Thekidmaroi/SwahiliLand" target="_blank" rel="noreferrer">View source ↗</a></nav>
    <header className="hero"><div className="eyebrow"><span className="live-dot" /> OPEN-SOURCE AFRICAN LANGUAGE NLP</div><h1>Language deserves <em>recognition.</em></h1><p>Discover people, places, and organizations in Kiswahili with transformer-powered named entity recognition.</p><div className="hero-meta"><span>Swahili NER</span><span>XLM-RoBERTa</span><span>FastAPI + Next.js</span></div></header>
    <section className="workspace" aria-label="NER playground">
      <div className="section-heading"><div><span className="step">01 / INPUT</span><h2>Try the model</h2></div><span className="muted">Up to 2,000 characters</span></div>
      <div className="input-card"><label htmlFor="text">Your Swahili text</label><textarea id="text" value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={5} placeholder="Andika sentensi kwa Kiswahili…" spellCheck={false} /><div className="input-footer"><span className="counter">{text.length.toLocaleString()} / 2,000</span><button onClick={analyze} disabled={loading || !text.trim()}>{loading ? <><span className="spinner" /> Analyzing…</> : <>Analyze entities <span aria-hidden="true">↗</span></>}</button></div></div>
      <div className="examples"><span>TRY AN EXAMPLE</span>{examples.map(ex => <button key={ex.title} className="example-button" onClick={() => { setText(ex.text); setEntities(null); setError(''); }} disabled={loading}>{ex.title} ↗</button>)}</div>
      <div className="section-heading result-heading"><div><span className="step">02 / OUTPUT</span><h2>Entity explorer</h2></div>{entities && <span className="result-count">{entities.length} {entities.length === 1 ? 'entity' : 'entities'} found</span>}</div>
      <section className="output-card" aria-live="polite" aria-busy={loading}>
        {loading && <div className="empty-state"><span className="spinner large" /><p>Running inference on the Swahili model…</p><small>CPU inference may take a moment.</small></div>}
        {error && <div className="error" role="alert"><strong>Analysis unavailable</strong><p>{error}</p><button className="retry" onClick={analyze}>Try again ↗</button></div>}
        {!loading && !error && !entities && <div className="empty-state"><span className="empty-icon">✳</span><p>Your annotated text will appear here.</p><small>Choose an example or enter a sentence above.</small></div>}
        {!loading && entities && <><div className="output-label">ANNOTATED TEXT</div><div className="annotated-text">{segmentEntities(submittedText, entities).map((segment, index) => segment.entity ? <mark key={index} className={`highlight ${labelClass(segment.entity.label)}`} title={`${segment.entity.label} · ${(segment.entity.score * 100).toFixed(1)}% confidence`}>{segment.text}<sup>{categories[segment.entity.label] ?? segment.entity.label}</sup></mark> : <span key={index}>{segment.text}</span>)}</div><div className="result-divider" /><div className="output-label">DETECTED ENTITIES</div>{entities.length ? <div className="entity-list">{entities.map((entity, index) => <div className="entity-row" key={index}><span className={`entity-dot ${labelClass(entity.label)}`} /><strong>{entity.text}</strong><span className="entity-type">{categories[entity.label] ?? entity.label}</span><span className="confidence">{(entity.score * 100).toFixed(1)}%</span></div>)}</div> : <p className="muted">No named entities detected in this sentence.</p>}<div className="result-meta">Inference latency: {latency === null ? '—' : (latency / 1000).toFixed(2) + ' s'} · Model scores are not calibrated probabilities.</div></>}
      </section>
    </section>
    <footer><span>SwahiliLand © 2026 · Built for African language technology</span><span>Research demonstration · Not for consequential decisions</span></footer>
  </main>;
}
