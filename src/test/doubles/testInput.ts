import { Input } from '@/app/input'
import { singleton } from 'tsyringe'

/**
 * Test double for Input class that extends the real Input
 * Overrides init() to prevent DOM access during testing
 */
@singleton()
export class TestInput extends Input {
  // Override init() to do nothing - prevents DOM access in tests
  init(): void {
    // No DOM event listeners in test environment
  }

  // Protected members are accessible for test simulation if needed
  // this.volatileDown, this.volatileHit, this.sampledDown, this.sampledHit
}
