import { BrowserFrameScheduler } from '@/app/browserFrameScheduler'
import { singleton } from 'tsyringe'

/**
 * Test double for BrowserFrameScheduler that runs once synchronously then stops
 * Extends the real scheduler but overrides forever() to prevent infinite loop
 */
@singleton()
export class TestSingleFrameScheduler extends BrowserFrameScheduler {
  forever(callback: (timestamp: number) => void): void {
    // Execute callback once with mock timestamp, then stop
    // This prevents infinite game loop in tests
    callback(16.67) // ~60fps frame time
  }
}
