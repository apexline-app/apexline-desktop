import { z } from '@/shared/ipc/validation';

export const OkResponseSchema = z.object({
  ok: z.literal(true),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
