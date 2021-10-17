import { default as axios } from 'axios';
import { promises as fs, createWriteStream } from 'fs';

export async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

export async function downloadStream(url: string, path: string): Promise<void> {
  const stream = createWriteStream(path);
  const response = await axios.get(url, { responseType: 'stream' });

  response.data.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
