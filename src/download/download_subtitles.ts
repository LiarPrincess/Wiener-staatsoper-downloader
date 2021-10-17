import { join } from 'path';
import { promises as fs } from 'fs';

import { Cache } from '../cache';
import { exists } from '../helpers';
import { Event, Stream } from '../intio_tv_api';

export async function downloadSubtitles(event: Event, stream: Stream, pathWithoutExtension: string) {
  const filePath = pathWithoutExtension + '.srt';

  const alreadyExists = await exists(filePath);
  if (!alreadyExists) {
    const vttFilesContent = await downloadVideoTextTracks(event, stream);
    const parts = extractParts(vttFilesContent);
    const fileContent = createSrtFileContent(parts);
    await fs.writeFile(filePath, fileContent, 'utf-8');
  }
}

// ===============================
// === VTT - Video Text Tracks ===
// ===============================

async function downloadVideoTextTracks(event: Event, stream: Stream): Promise<string[]> {
  const cacheDir = join('download_subtitles', `${event.title}-${stream.id}`);
  const cache = new Cache(cacheDir);

  const startIndex = 1;
  const endIndex = 50_000;
  let index = startIndex;

  const result: string[] = [];
  while (true) {
    const url = `https://live.performa.intio.tv/media/${stream.id}/subs-eng-${index}.vtt`;

    try {
      const content = await cache.download(url);
      result.push(content);
    } catch (error) {
      if (index == startIndex) {
        throw new Error(`Unable to download '${url}'`);
      } else {
        // We assume that this was the last VTT file.
        return result;
      }
    }

    if (index == endIndex) {
      return result;
    }

    index += 1;
  }
}

// =============
// === Parts ===
// =============

export interface Part {
  startTime: string;
  endTime: string;
  content: string;
}

function extractParts(vttFilesContent: string[]): Part[] {
  const result: Part[] = [];

  let previousPart: Part | undefined = undefined;
  for (const vtt of vttFilesContent) {
    const parts = parseVTT(vtt);

    for (const part of parts) {
      if (!previousPart) {
        result.push(part);
        previousPart = part;
        continue;
      }

      if (part.content === previousPart.content) {
        // Just make previous part longer.
        previousPart.endTime = part.endTime;
      } else {
        // Make so that the part lasts till the next part.
        // previousPart.endTime = part.startTime;
        result.push(part);
      }

      previousPart = part;
    }
  }

  return result;
}

export function parseVTT(vtt: string): Part[] {
  const header = 'WEBVTT';
  if (!vtt.startsWith(header)) {
    throw new Error(`Malformed VTT file: missing '${header}' header.`);
  }

  const content = vtt.substring(header.length).trim();
  if (content.length == 0) {
    return []; // Skip empty file.
  }

  const result: Part[] = [];
  let currentPart: Part | undefined = undefined;
  for (const l of content.split('\n')) {
    let line = l.trim();

    const isEmptyLine = line.length == 0;
    if (isEmptyLine) {
      continue;
    }

    const isTimeLine = line.includes('-->');
    if (isTimeLine) {
      if (currentPart && currentPart.content) {
        result.push(currentPart);
      }

      const [startTime, endTime] = line.split(' --> ');
      currentPart = { startTime, endTime, content: '' };
      continue;
    }

    // This is the part line (as in 'person speaking')
    line = line.replace('&nbsp;', '');
    line = line.trim();

    if (line.length > 0) {
      if (!currentPart) {
        throw new Error('Malformed VTT file: part without time');
      }

      const isFirstLine = currentPart.content.length == 0;
      if (isFirstLine) {
        currentPart.content += line;
      } else {
        // If this is the n-th line we need separator
        const isNewPerson = line.startsWith('-');
        const separator = isNewPerson ? '\n' : ' ';
        currentPart.content += separator + line;
      }
    }
  }

  // Add the last part.
  if (currentPart && currentPart.content) {
    result.push(currentPart);
  }

  return result;
}

// =================
// === Write srt ===
// =================

export function createSrtFileContent(parts: Part[]): string {
  let result = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // 1
    // 00:00:01,520 --> 00:00:01,550
    // Nessun dorma! Nessun dorma!
    const startTime = formatTime(part.startTime);
    const endTime = formatTime(part.endTime);

    result += `\
${i + 1}
${startTime} --> ${endTime}
${part.content}

`;
  }

  return result;
}

function formatTime(time: string): string {
  // Below 1h:   15:36.000
  // Over 1h:  2:27:35.840
  const split = time.split(':');
  const hasHours = split.length == 3;

  const hour = pad(hasHours ? split[0] : '0', 2);
  const min = pad(hasHours ? split[1] : split[0], 2);

  const secMilliseconds = hasHours ? split[2] : split[1];
  const secMillisecondsSplit = secMilliseconds.split('.');
  const sec = pad(secMillisecondsSplit[0], 2);
  const milliseconds = pad(secMillisecondsSplit.length == 2 ? secMillisecondsSplit[1] : '000', 3);

  return `${hour}:${min}:${sec},${milliseconds}`;
}

function pad(s: string, length: number): string {
  const paddingLength = length - s.length;
  if (paddingLength <= 0) {
    return s;
  }

  const padding = '0'.repeat(paddingLength);
  return padding + s;
}
