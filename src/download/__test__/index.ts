import { run as subtitles_createSrt_tests } from './subtitles_createSrt_tests';
import { run as subtitles_parseVTT_tests } from './subtitles_parseVTT_tests';

export function run() {
  subtitles_createSrt_tests();
  subtitles_parseVTT_tests();
}
