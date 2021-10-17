export function assertEqual(result: string, expected: string) {
  if (result != expected) {
    const resultMsg = result.replace(/\n/g, '\\n');
    const expectedMsg = expected.replace(/\n/g, '\\n');
    throw new Error(`${resultMsg} VS ${expectedMsg}`);
  }
}
