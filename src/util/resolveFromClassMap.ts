import { container } from 'tsyringe'

/**
 * Generic helper to lazily resolve classes from a class map using dependency injection.
 *
 * @param classMap - Object mapping keys to class constructors
 * @param key - The key to resolve
 * @returns The resolved instance from the DI container
 */
export function resolveFromClassMap<TClassMap extends Record<string, new(...args: any[]) => any>>(
  classMap: TClassMap,
  key: keyof TClassMap
): InstanceType<TClassMap[keyof TClassMap]> {
  const ClassConstructor = classMap[key]
  if (!ClassConstructor) {
    throw new Error(`Class not found for key: ${String(key)}`)
  }
  return container.resolve(ClassConstructor)
}