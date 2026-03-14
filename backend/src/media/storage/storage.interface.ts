export interface StorageProvider {
  save(filename: string, data: Buffer): Promise<string>;
  delete(filename: string): Promise<void>;
  getUrl(filename: string): string;
}
