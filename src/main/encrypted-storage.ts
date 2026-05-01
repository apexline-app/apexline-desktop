import { app, safeStorage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const resolvePath = (filename: string) =>
  path.join(app.getPath('userData'), filename);

export const writeEncryptedJson = (filename: string, data: unknown) => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('safe-storage-unavailable');
  }
  const filePath = resolvePath(filename);
  const tmpPath = `${filePath}.tmp`;
  const encrypted = safeStorage.encryptString(JSON.stringify(data));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmpPath, encrypted);
  fs.renameSync(tmpPath, filePath);
};

export const readEncryptedJson = <T>(filename: string): T | null => {
  const filePath = resolvePath(filename);
  try {
    const buf = fs.readFileSync(filePath);
    if (!safeStorage.isEncryptionAvailable()) return null;
    return JSON.parse(safeStorage.decryptString(buf)) as T;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn(`[encrypted-storage] read failed for ${filename}:`, err);
    }
    return null;
  }
};

export const deleteEncryptedJson = (filename: string) => {
  const filePath = resolvePath(filename);
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn(`[encrypted-storage] delete failed for ${filename}:`, err);
    }
  }
};
