import { z } from '@/shared/ipc/validation';

export const UserSchema = z.object({
  pid: z.string(),
  email: z.email(),
  nickname: z.string(),
});

export type User = z.infer<typeof UserSchema>;
