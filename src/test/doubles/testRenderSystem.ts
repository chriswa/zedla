import { RenderSystem } from '@/game/ecs/systems/renderSystem'
import { RoomContext } from '@/game/roomContext'
import { singleton } from 'tsyringe'

/**
 * Test double for RenderSystem that extends the real RenderSystem
 * Overrides render method to prevent browser API calls during testing
 */
@singleton()
export class TestRenderSystem extends RenderSystem {
  render(_renderBlend: number, _roomContext: RoomContext): void {
    // No-op render - skip all browser-dependent drawing operations
    // This allows game logic to run without needing canvas/window APIs
  }
}
