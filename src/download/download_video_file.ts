import { exec as _exec } from 'child_process';
import { promisify } from 'util';

import { exists } from '../helpers';
import { Event, Stream } from '../intio_tv_api';

const exec = promisify(_exec);

export async function downloadVideoFile(event: Event, stream: Stream, pathWithoutExtension: string) {
  const file = pathWithoutExtension + '.mp4';

  const alreadyExists = await exists(file);
  if (!alreadyExists) {
    const url = `https://live.performa.intio.tv/media/${stream.id}/master-allsubs.m3u8`;
    const command = `ffmpeg -i "${url}" -c copy -bsf:a aac_adtstoasc "${file}"`;

    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  }
}
