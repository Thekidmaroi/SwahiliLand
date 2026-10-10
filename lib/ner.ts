import { z } from 'zod';

export const inputSchema = z.object({ text: z.string().trim().min(1).max(2000) });
export type Entity = { text: string; label: string; score: number; start: number | null; end: number | null };
export type Segment = { text: string; entity?: Entity };
const rawEntitySchema = z.object({
  word: z.string().optional(), entity_group: z.string().optional(), entity: z.string().optional(),
  score: z.number().min(0).max(1), start: z.number().int().nonnegative().nullable().optional(),
  end: z.number().int().nonnegative().nullable().optional(),
});
export function normalizeEntities(data: unknown): Entity[] {
  return z.array(rawEntitySchema).parse(data).map(item => ({
    text: item.word ?? '', label: item.entity_group ?? item.entity ?? 'UNKNOWN',
    score: item.score, start: item.start ?? null, end: item.end ?? null,
  }));
}
/** Highlight valid, non-overlapping character offsets; never guess offsets from tokens. */
export function segmentEntities(text: string, entities: Entity[]): Segment[] {
  const valid = entities.filter(e => e.start !== null && e.end !== null &&
    e.start >= 0 && e.end > e.start && e.end <= text.length)
    .sort((a, b) => a.start! - b.start! || b.score - a.score);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const entity of valid) {
    const start = entity.start!, end = entity.end!;
    if (start < cursor) continue;
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    segments.push({ text: text.slice(start, end), entity });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length ? segments : [{ text }];
}
