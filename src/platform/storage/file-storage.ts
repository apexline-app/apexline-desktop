import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { ZodSchema } from 'zod';

const resolvePath = (filename: string) =>
  path.join(app.getPath('userData'), filename);

export const readJson = <T>(
  filename: string,
  schema: ZodSchema<T>,
  fallback: unknown = {},
): T => {
  const filePath = resolvePath(filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return schema.parse(JSON.parse(raw));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn(
        `[file-storage] read failed for ${filename}, using fallback:`,
        err,
      );
    }
    return schema.parse(fallback);
  }
};

export const writeJson = <T>(filename: string, data: T): void => {
  const filePath = resolvePath(filename);
  const tmpPath = `${filePath}.tmp`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath);
};
