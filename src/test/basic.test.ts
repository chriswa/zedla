// Import some project types to verify path mapping works
import { Button } from '@/app/input'
import { EntityId } from '@/game/ecs/ecs'
import { describe, expect, it } from 'vitest'

describe('Basic Compilation Test', () => {
  it('should compile TypeScript correctly', () => {
    // Simple assertion to verify test framework works
    expect(1 + 1).toBe(2)
  })

  it('should resolve path aliases correctly', () => {
    // Verify that imports with @/ alias work
    // If compilation succeeds, path mapping is working
    const testButton: Button = 0 // Button.DOWN has value 0
    const testEntityId: EntityId = 1 as EntityId

    expect(typeof testButton).toBe('number')
    expect(typeof testEntityId).toBe('number')
  })

  it('should have access to vitest globals', () => {
    // Verify that vitest globals (describe, it, expect) are available
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })
})
