import { Ctor } from './type/ctor'
import { container, DependencyContainer } from 'tsyringe'

/**
 * Generic class map resolver base class for DI-based lazy resolution.
 *
 * Provides type-safe lazy resolution of classes from a class map.
 * Designed to be extended by specific resolver singletons.
 */

export class ClassMapResolver<TClassMap extends Record<string, Ctor<unknown>>> {
  constructor(
    private classMap: TClassMap,
    private containerInstance: DependencyContainer = container,
  ) {}

  /**
   * Lazily resolve a class by key from the class map.
   *
   * @param key - The key to resolve
   * @returns The resolved instance from the DI container
   */
  resolve<K extends keyof TClassMap>(key: K): InstanceType<TClassMap[K]> {
    const ClassConstructor = this.classMap[key]
    if (!ClassConstructor) {
      throw new Error(`Class not found for key: ${String(key)}`)
    }

    return this.containerInstance.resolve(ClassConstructor) as InstanceType<TClassMap[K]>
  }

  /**
   * Get all available keys in this registry.
   */
  getKeys(): Array<keyof TClassMap> {
    return Object.keys(this.classMap)
  }
}
