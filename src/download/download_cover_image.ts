import { extname } from 'path';

import { Event } from '../intio_tv_api';
import { exists, downloadStream } from '../helpers';

export async function downloadCoverImage(event: Event, pathWithoutExtension: string): Promise<void> {
  const url = event.cover_image.url;

  const extension = extname(url);
  const file = pathWithoutExtension + extension;

  const alreadyExists = await exists(file);
  if (!alreadyExists) {
    await downloadStream(url, file);
  }
}
