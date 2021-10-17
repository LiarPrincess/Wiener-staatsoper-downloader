import { join } from 'path';
import { promises as fs } from 'fs';

import {
  Event,
  getAllEvents,
  getStream
} from './intio_tv_api';
import {
  downloadCoverImage,
  downloadSubtitles,
  downloadVideoFile
} from './download';

import { run as runTests } from './download/__test__';

const outputDir = './output';
const browserAuthorization = 'token FILL_ME';

(async () => {
  try {
    // Scenario 1: List all events
    // const eventsAllFilePath = './events_all.md';
    // await writeAllEvents(eventsAllFilePath);

    // Scenario 2: Download selected events
    const eventsToDownloadFilePath = './events_to_download.md';
    await downloadEventsFromFile(eventsToDownloadFilePath);

    // Tests
    // runTests();

    console.log('Finished');
  } catch (error) {
    console.log(error);
  }
})();

/* ======================== */
/* === Print all events === */
/* ======================== */

async function writeAllEvents(filePath: string) {
  const events = await getAllEvents();
  const eventsByTitle = events.sort((lhs: Event, rhs: Event) => lhs.title < rhs.title ? -1 : 1);

  let fileContent = '';
  let previousTitle: string | undefined;

  for (const event of eventsByTitle) {
    const title = event.title;
    const hasTitleChanged = title != previousTitle;
    if (hasTitleChanged) {
      console.log(event.title);
      fileContent += `# ${title}\n`;
    }

    fileContent += `${event.begin_time}|${event.id}\n`;
    previousTitle = title;
  }

  await fs.writeFile(filePath, fileContent, 'utf-8');
}

/* ======================= */
/* === Download events === */
/* ======================= */

async function downloadEventsFromFile(filePath: string) {
  // We need to use 'getAllEvents' instead of 'getEvent' because 'intio'
  // tends to remove old event entries (but they do not remove them from list).
  const events = await getAllEvents();
  const eventsById = mapEventsById(events);

  let previousTitle: string | undefined;
  const downloadedStreamIds = new Set<string>();

  const eventIds = await parseEventIdsFromFile(filePath);
  for (const id of eventIds) {
    const event = eventsById[id];
    if (!event) {
      console.log(`  Unable to find event with id: ${id}`);
      continue;
    }

    const title = event.title;
    if (title != previousTitle) {
      console.log(title);
    }

    const streamConfig = await getStream(event, browserAuthorization);
    const streams = streamConfig.streams;
    if (streams.length != 1) {
      console.log(`  Invalid stream count: ${streams.length}`);
      continue;
    }

    const stream = streams[0];
    if (downloadedStreamIds.has(stream.id)) {
      continue;
    }

    console.log(`  Stream: ${stream.id}`);
    downloadedStreamIds.add(stream.id);

    const dir = join(outputDir /*, title*/);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${title}-${stream.id}`;
    const pathWithoutExtension = join(dir, filename);

    try {
      console.log('    Downloading cover');
      const coverFilePath = pathWithoutExtension + '_cover';
      await downloadCoverImage(event, coverFilePath);
    } catch (error) { }

    try {
      console.log('    Downloading subtitles');
      await downloadSubtitles(event, stream, pathWithoutExtension);
    } catch (error) { }

    try {
      console.log('    Downloading movie');
      await downloadVideoFile(event, stream, pathWithoutExtension);
    } catch (error) { }

    previousTitle = title;
  }
}

async function parseEventIdsFromFile(filePath: string): Promise<string[]> {
  const result: string[] = [];

  const content = await fs.readFile(filePath, 'utf-8');
  for (const l of content.split('\n')) {
    const line = l.trim();

    const isEmptyOrComment = !line || line.startsWith('#');
    if (isEmptyOrComment) {
      continue;
    }

    const [_, id] = line.split('|');
    result.push(id);
  }

  return result;
}

interface EventsById {
  [key: string]: Event;
}

function mapEventsById(events: Event[]): EventsById {
  const result: any = {};

  for (const event of events) {
    result[event.id] = event;
  }

  return result;
}
