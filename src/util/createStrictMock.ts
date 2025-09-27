/**
 * Creates a strict mock proxy that throws fatal errors when unknown properties are accessed.
 * Useful for test doubles where you want to explicitly define what's mocked and catch
 * when new properties/methods are used that need to be added to the mock.
 */
export function createStrictMock<T>(stub: Partial<T>): T {
  return new Proxy(stub, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target]
      }
      throw new Error(`FATAL: ${String(prop)} not mocked - add to stub`)
    },
    set(target, prop, value) {
      if (prop in target) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target[prop as keyof typeof target] = value
        return true
      }
      throw new Error(`FATAL: ${String(prop)} not mocked - add to stub`)
    },
  }) as T
}
