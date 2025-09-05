export function assert(condition: boolean, message?: string) {
  if (!condition) {
    // eslint-disable-next-line no-debugger
    debugger
    throw new Error(`assertion failed: ${message ?? 'no message supplied'}`)
  }
}
