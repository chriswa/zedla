export function assert(condition: Boolean, message?: string) {
  if (!condition) {
    debugger
    throw new Error(`assertion failed: ${message ?? 'no message supplied'}`)
  }
}
