import { App } from '@/app/app'
import { container } from 'tsyringe'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Integration Tests', () => {
  beforeEach(() => {
    // Clear container instances between tests for isolation
    container.clearInstances()
  })

  it('should boot app and run one tick without errors', async () => {
    // Create and boot the app with all our test doubles in place
    const app = container.resolve(App)

    // This should not throw any errors with our test infrastructure:
    // - TestInput (no DOM event listeners)
    // - TestCanvas (no DOM manipulation)
    // - TestImageLoader (no network requests)
    // - TestSingleFrameScheduler (runs one tick then stops)

    // Boot the app - this will load assets and start the game loop
    await app.boot()

    // If we get here, the app successfully:
    // ✅ Booted without browser dependency errors
    // ✅ Loaded assets (via TestImageLoader)
    // ✅ Started frame loop (via TestSingleFrameScheduler)
    // ✅ Executed one complete game tick without crashing
    // ✅ Processed input, physics, rendering, etc.

    expect(app).toBeDefined()
  })
})
