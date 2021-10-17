import { join } from 'path';
import { Stream } from 'stream';
import { AxiosRequestConfig, default as axios } from 'axios';
import { promises as fs, createWriteStream } from 'fs';

const encoding = 'utf8';
const rootCacheDir = join('.', 'cache');
const forbiddenKeyCharacters = new Set(['/', '\\', '?', ':', '#']);

export class Cache {

  private readonly dir: string;

  constructor(name: string) {
    this.dir = join(rootCacheDir, name);
  }

  /* ============== */
  /* === String === */
  /* ============== */

  async get(key: string): Promise<string | undefined> {
    try {
      const path = await this.createFilePath(key);
      return await fs.readFile(path, encoding);
    } catch (error) {
      return undefined;
    }
  }

  async put(key: string, data: string): Promise<void> {
    const path = await this.createFilePath(key);
    await fs.writeFile(path, data, encoding);
  }

  async getAllKeys(filter: RegExp): Promise<string[]> {
    const files = await fs.readdir(this.dir);
    return files.filter(filename => filter.test(filename));
  }

  async download(url: string, options?: AxiosRequestConfig): Promise<string> {
    const cacheKey = this.createCacheKey(url);

    const cached = await this.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await axios.get(url, options);
    const content = response.data as string;

    await this.put(cacheKey, content);
    return content;
  }

  async downloadJSON(url: string, options?: AxiosRequestConfig): Promise<any> {
    const cacheKey = this.createCacheKey(url) + '.json';

    const cached = await this.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await axios.get(url, options);
    const object = response.data;
    await this.put(cacheKey, JSON.stringify(object));
    return object;
  }

  private createCacheKey(url: string): string {
    return url.replace(/[\/:]/g, '');
  }

  /* ============== */
  /* === Binary === */
  /* ============== */

  /**
   * Get path to cached binary file.
   */
  async getBinaryPath(key: string): Promise<string | undefined> {
    try {
      const path = await this.createFilePath(key);
      await fs.stat(path); // stat will throw on "ENOENT"
      return path;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Add binary data to cache.
   */
  async putBinary(key: string, data: Stream): Promise<string> {
    const path = await this.createFilePath(key);
    const fileStream = createWriteStream(path);

    data.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    })
      .then(() => path);
  }

  /* =============== */
  /* === Helpers === */
  /* =============== */

  private async createFilePath(key: string): Promise<string> {
    let escaped = '';

    for (const char of key) {
      if (!forbiddenKeyCharacters.has(char)) {
        escaped += char;
      }
    }

    await fs.mkdir(this.dir, { recursive: true });
    return join(this.dir, escaped);
  }
}
