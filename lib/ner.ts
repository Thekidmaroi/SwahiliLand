import { z } from 'zod';

export const inputSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
export type Entity = {
  text: string;
  label: string;
  score: number;
  start: number | null;
  end: number | null;
};

const rawEntitySchema = z.object({
  word: z.string().optional(),
  entity_group: z.string().optional(),
  entity: z.string().optional(),
  score: z.number().min(0).max(1),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().nonnegative().optional(),
});

export function normalizeEntities(data: unknown): Entity[] {
  const parsed = z.array(rawEntitySchema).parse(data);
  return parsed.map((item) => ({
    text: item.word ?? '',
    label: item.entity_group ?? item.entity ?? 'UNKNOWN',
    score: item.score,
    start: item.start ?? null,
    end: item.end ?? null,
  }));
}
