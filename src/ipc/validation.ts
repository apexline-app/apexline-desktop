import type { IpcMainInvokeEvent } from 'electron';
import { z, type ZodSchema } from 'zod';

export const withValidation =
  <TInput, TOutput>(
    schema: ZodSchema<TInput>,
    handler: (
      input: TInput,
      event: IpcMainInvokeEvent,
    ) => Promise<TOutput> | TOutput,
  ) =>
  async (event: IpcMainInvokeEvent, raw: unknown): Promise<TOutput> => {
    const parsed = schema.parse(raw);
    return handler(parsed, event);
  };

export { z };
