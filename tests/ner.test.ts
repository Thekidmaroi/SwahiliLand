import { describe, expect, it } from 'vitest';
import { inputSchema, normalizeEntities, segmentEntities } from '../lib/ner';

describe('NLP contract', () => {
  it('accepts Swahili text', () => expect(inputSchema.safeParse({ text: 'Habari za asubuhi' }).success).toBe(true));
  it('rejects empty text', () => expect(inputSchema.safeParse({ text: '   ' }).success).toBe(false));
  it('rejects oversized input', () => expect(inputSchema.safeParse({ text: 'a'.repeat(2001) }).success).toBe(false));
  it('normalizes token-classification results', () => expect(normalizeEntities([{ word: 'Nairobi', entity_group: 'LOC', score: 0.97, start: 0, end: 7 }])[0]).toEqual({ text: 'Nairobi', label: 'LOC', score: 0.97, start: 0, end: 7 }));
  it('rejects malformed provider results', () => expect(() => normalizeEntities({ error: 'unavailable' })).toThrow());
  it('preserves text and highlights valid entity offsets', () => {
    const text = 'Amina yuko Nairobi.';
    const result = segmentEntities(text, [{ text: 'Nairobi', label: 'LOC', score: 0.9, start: 11, end: 18 }]);
    expect(result.map(s => s.text).join('')).toBe(text);
    expect(result[1].entity?.label).toBe('LOC');
  });
  it('ignores overlapping, missing and invalid offsets safely', () => {
    const text = 'Nairobi Kenya';
    const result = segmentEntities(text, [
      { text: 'Nairobi', label: 'LOC', score: .9, start: 0, end: 7 },
      { text: 'Nairobi Kenya', label: 'LOC', score: .5, start: 0, end: 13 },
      { text: 'unknown', label: 'LOC', score: .4, start: null, end: null },
    ]);
    expect(result.map(s => s.text).join('')).toBe(text);
    expect(result.filter(s => s.entity)).toHaveLength(1);
  });
  it('does not highlight invalid offsets', () => {
    expect(segmentEntities('Kenya', [{ text: 'Kenya', label: 'LOC', score: .9, start: 0, end: 50 }])).toEqual([{ text: 'Kenya' }]);
  });
});
