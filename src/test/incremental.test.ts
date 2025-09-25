// Import App.ts to verify path aliases and reflect-metadata work
import { App } from '@/app/app'
import { Input } from '@/app/input'
import { TestInput } from '@/test/doubles/testInput'
import { container } from 'tsyringe'
import { describe, expect, it } from 'vitest'

describe('Incremental Integration Tests', () => {
  it('should import App.ts without errors', () => {
    // If this test passes, it means:
    // - Path aliases (@/) are working correctly
    // - reflect-metadata is loaded properly (App uses @singleton decorator)
    // - TypeScript compilation with decorators works
    // - All transitive imports resolve correctly
    expect(App).toBeDefined()
    expect(typeof App).toBe('function')
  })

  it('should resolve singletons from tsyringe container', () => {
    // Test that our DI setup works correctly in test environment
    const inputInstance = container.resolve(Input)

    // Should get TestInput (not real Input) due to DI swapping
    expect(inputInstance).toBeInstanceOf(TestInput)
    expect(inputInstance).toBeDefined()

    // Should be a singleton - same instance when resolved again
    const inputInstance2 = container.resolve(Input)
    expect(inputInstance).toBe(inputInstance2)
  })
})
