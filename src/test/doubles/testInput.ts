import { Button, Input } from '@/app/input'
import { singleton } from 'tsyringe'

/**
 * Test double for Input class that extends the real Input
 * Provides test-friendly methods to simulate button presses
 */
@singleton()
export class TestInput extends Input {
  // Override init() to do nothing - prevents DOM access in tests
  override init(): void {
    // No DOM event listeners in test environment
  }

  /**
   * Simulate a button press (adds to both down and hit state)
   * Call sample() after setting inputs to make them available to game logic
   */
  simulateButtonPress(button: Button): void {
    this.volatileDown.add(button)
    this.volatileHit.add(button)
  }

  /**
   * Simulate a button release (removes from down state)
   * Call sample() after setting inputs to make them available to game logic
   */
  simulateButtonRelease(button: Button): void {
    this.volatileDown.delete(button)
  }

  /**
   * Clear all input state (useful for resetting between test cases)
   */
  clearAllInputs(): void {
    this.volatileDown.clear()
    this.volatileHit.clear()
    this.sampledDown.clear()
    this.sampledHit.clear()
  }
}
