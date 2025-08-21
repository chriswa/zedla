export function assert(condition: Boolean) {
  if (!condition) {
    throw new Error('assertion failed')
  }
}
