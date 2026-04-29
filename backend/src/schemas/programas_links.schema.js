import { z } from 'zod';

export const linkProgramaSchema = z.object({
  body: z.object({
    programa_id: z.number().int().positive(),
    item_id: z.number().int().positive(),
  }),
});

export const bulkLinkProgramaSchema = z.object({
  body: z.object({
    programa_id: z.number().int().positive(),
    item_ids: z.array(z.number().int().positive()),
  }),
});
