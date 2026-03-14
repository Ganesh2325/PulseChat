import { StorageProvider } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = path.resolve(uploadDir);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(filename: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, data);
    return `/uploads/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
