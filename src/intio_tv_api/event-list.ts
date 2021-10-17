import { Event } from './event';
import { Cache } from '../cache';

const cache = new Cache('event-list');
const cachedResultKey = 'result.json';

export async function getAllEvents(): Promise<Event[]> {
  const cachedResult = await cache.get(cachedResultKey);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  const result: Event[] = [];
  const removeDuplicates = new Set<string>();

  let url: string | undefined = 'https://live.performa.intio.tv/api/v1/events';
  while (url) {
    const page: any = await cache.downloadJSON(url);
    const events: Event[] = page.results;

    for (const e of events) {
      const event: Event = {
        ...e,
        title: e.title.trim(), // override
        title_ext: e.title_ext.trim() // override
      };

      const date = event.begin_time;
      const hasCorrectDate = date && (date.startsWith('2020') || date.startsWith('2021'));
      if (!hasCorrectDate) {
        continue;
      }

      const isFree = event.tags.some(t => t.name == 'Free (sponsored)');
      if (!isFree) {
        continue;
      }

      const duplicateKey = event.begin_time + event.title;
      if (removeDuplicates.has(duplicateKey)) {
        continue;
      }

      result.push(event);
      removeDuplicates.add(duplicateKey);
    }

    url = page.next;
  }

  const sortedResult = result.sort((lhs: Event, rhs: Event) => lhs.begin_time < rhs.begin_time ? -1 : 1);
  cache.put(cachedResultKey, JSON.stringify(sortedResult));
  return sortedResult;
}
