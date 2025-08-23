export function assert(condition: Boolean) {
  if (!condition) {
    debugger
    throw new Error('assertion failed')
  }
}
