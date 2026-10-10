import { describe, expect, it } from 'vitest';
import { inputSchema, normalizeEntities } from '../lib/ner';
describe('NLP contract', () => {
  it('accepts Swahili text', () => expect(inputSchema.safeParse({ text: 'Habari za asubuhi' }).success).toBe(true));
  it('rejects empty text', () => expect(inputSchema.safeParse({ text: '   ' }).success).toBe(false));
  it('rejects oversized input', () => expect(inputSchema.safeParse({ text: 'a'.repeat(2001) }).success).toBe(false));
  it('normalizes token-classification results', () => expect(normalizeEntities([{ word: 'Nairobi', entity_group: 'LOC', score: 0.97, start: 0, end: 7 }])[0]).toEqual({ text: 'Nairobi', label: 'LOC', score: 0.97, start: 0, end: 7 }));
  it('rejects malformed provider results', () => expect(() => normalizeEntities({ error: 'unavailable' })).toThrow());
});
