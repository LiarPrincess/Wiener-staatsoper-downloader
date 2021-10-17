import { assertEqual } from './helpers';
import { parseVTT } from '../download_subtitles';

export function run() {
  singleLineParts();
  multiLineParts();

  emptyPart_inTheMiddle();
  emptyPart_atEnd();

  nonBreakingSpace();
}

function assertPartCount(result: any[], expected: number) {
  if (result.length != expected) {
    throw new Error(`Invalid part count: ${result.length} VS ${expected}`);
  }
}

function singleLineParts() {
  const input = `\
WEBVTT

2:27:30.000 --> 2:27:35.840

- None shall sleep!A


2:27:35.840 --> 2:27:36.000

- None shall sleep!B
`;

  const result = parseVTT(input);
  assertPartCount(result, 2);

  const part0 = result[0];
  assertEqual(part0.startTime, '2:27:30.000');
  assertEqual(part0.endTime, '2:27:35.840');
  assertEqual(part0.content, '- None shall sleep!A');

  const part1 = result[1];
  assertEqual(part1.startTime, '2:27:35.840');
  assertEqual(part1.endTime, '2:27:36.000');
  assertEqual(part1.content, '- None shall sleep!B');
}

function multiLineParts() {
  const input = `\
WEBVTT

15:24.000 --> 15:28.360
- People of Peking! This
is the law: A


15:28.360 --> 15:28.720
- People of Peking! This
is the law: B



`;

  const result = parseVTT(input);
  assertPartCount(result, 2);

  const part0 = result[0];
  assertEqual(part0.startTime, '15:24.000');
  assertEqual(part0.endTime, '15:28.360');
  assertEqual(part0.content, '- People of Peking! This is the law: A');

  const part1 = result[1];
  assertEqual(part1.startTime, '15:28.360');
  assertEqual(part1.endTime, '15:28.720');
  assertEqual(part1.content, '- People of Peking! This is the law: B');
}

function emptyPart_inTheMiddle() {
  const input = `\
WEBVTT

2:27:06.000 --> 2:27:10.360

This night in Peking none shall sleep. A


2:27:10.360 --> 2:27:10.760


2:27:10.760 --> 2:27:12.000

This night in Peking none shall sleep. B
`;

  const result = parseVTT(input);
  assertPartCount(result, 2);

  const part0 = result[0];
  assertEqual(part0.startTime, '2:27:06.000');
  assertEqual(part0.endTime, '2:27:10.360');
  assertEqual(part0.content, 'This night in Peking none shall sleep. A');

  const part1 = result[1];
  assertEqual(part1.startTime, '2:27:10.760');
  assertEqual(part1.endTime, '2:27:12.000');
  assertEqual(part1.content, 'This night in Peking none shall sleep. B');
}

function emptyPart_atEnd() {
  const input = `\
WEBVTT

2:27:06.000 --> 2:27:10.360

This night in Peking none shall sleep. A


2:27:10.360 --> 2:27:10.760

This night in Peking none shall sleep. B


2:27:10.760 --> 2:27:12.000


`;

  const result = parseVTT(input);
  assertPartCount(result, 2);

  const part0 = result[0];
  assertEqual(part0.startTime, '2:27:06.000');
  assertEqual(part0.endTime, '2:27:10.360');
  assertEqual(part0.content, 'This night in Peking none shall sleep. A');

  const part1 = result[1];
  assertEqual(part1.startTime, '2:27:10.360');
  assertEqual(part1.endTime, '2:27:10.760');
  assertEqual(part1.content, 'This night in Peking none shall sleep. B');
}

function nonBreakingSpace() {
  const input = `\
WEBVTT

15:24.000 --> 15:28.360
- People of Peking! This is the law: A


15:28.360 --> 15:28.720
&nbsp;


15:28.720 --> 15:30.000
- People of Peking! This is the law: B

`;

  const result = parseVTT(input);
  assertPartCount(result, 2);

  const part0 = result[0];
  assertEqual(part0.startTime, '15:24.000');
  assertEqual(part0.endTime, '15:28.360');
  assertEqual(part0.content, '- People of Peking! This is the law: A');

  const part1 = result[1];
  assertEqual(part1.startTime, '15:28.720');
  assertEqual(part1.endTime, '15:30.000');
  assertEqual(part1.content, '- People of Peking! This is the law: B');
}
