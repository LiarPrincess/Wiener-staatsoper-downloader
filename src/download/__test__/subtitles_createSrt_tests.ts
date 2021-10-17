import { assertEqual } from './helpers';
import { createSrtFileContent, Part } from '../download_subtitles';

export function run() {
  singlePart_singleLine();
  singlePart_multipleLines();

  multipleParts();
  aboveHour();
}

function singlePart_singleLine() {
  const parts: Part[] = [
    {
      startTime: '15:36.000',
      endTime: '15:37.240',
      content: '- None shall sleep!'
    }
  ];

  const result = createSrtFileContent(parts);
  assertEqual(result, `\
1
00:15:36,000 --> 00:15:37,240
- None shall sleep!

`);
}

function singlePart_multipleLines() {
  const parts: Part[] = [
    {
      startTime: '15:36.000',
      endTime: '15:37.240',
      content: '- None shall sleep!\n- None shall sleep!'
    }
  ];

  const result = createSrtFileContent(parts);
  assertEqual(result, `\
1
00:15:36,000 --> 00:15:37,240
- None shall sleep!
- None shall sleep!

`);
}

function multipleParts() {
  const parts: Part[] = [
    {
      startTime: '15:36.000',
      endTime: '15:37.240',
      content: '- None shall sleep! A'
    },
    {
      startTime: '16:36.000',
      endTime: '16:37.240',
      content: '- None shall sleep! B'
    }
  ];

  const result = createSrtFileContent(parts);
  assertEqual(result, `\
1
00:15:36,000 --> 00:15:37,240
- None shall sleep! A

2
00:16:36,000 --> 00:16:37,240
- None shall sleep! B

`);
}

function aboveHour() {
  const parts: Part[] = [
    {
      startTime: '2:27:30.000',
      endTime: '2:27:35.840',
      content: '- None shall sleep!'
    }
  ];

  const result = createSrtFileContent(parts);
  assertEqual(result, `\
1
02:27:30,000 --> 02:27:35,840
- None shall sleep!

`);
}
