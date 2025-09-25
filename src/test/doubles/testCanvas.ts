import { singleton } from 'tsyringe'

/**
 * Test double for Canvas class that provides stub implementations
 * without any DOM dependencies
 */
@singleton()
export class TestCanvas {
  // Stub canvas element and context - just plain objects that satisfy the interface
  public readonly el: any = {
    width: 800,
    height: 600,
    style: {},
  }

  public readonly ctx: any = {
    // Rendering methods
    clearRect: () => {},
    setTransform: () => {},
    save: () => {},
    restore: () => {},
    fillText: () => {},

    // Properties that can be set
    font: '',
    fillStyle: '',
    globalAlpha: 1,

    // Add more context methods as needed when tests require them
  }

  constructor() {
    // Safe for testing - no DOM access
  }

  public cls() {
    // Stub implementation - no actual clearing needed in tests
  }
}
