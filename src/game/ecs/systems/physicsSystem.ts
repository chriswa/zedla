import { TileCollisionService } from '@/game/collision/tileCollisionService'
import { ECS } from '@/game/ecs/ecs'
import { ITickingSystem } from '@/game/ecs/systems/types'
import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { Disposable, singleton } from 'tsyringe'

export const GRAVITY = 100

@singleton()
export class PhysicsSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
    private tileCollisionService: TileCollisionService,
  ) {
  }

  tick(roomContext: RoomContext) {
    // Store previous positions before updating current positions
    vec2.copy(roomContext.camera.previousOffset, roomContext.camera.offset)

    for (const [_entityId, components] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
      const positionComponent = components.PositionComponent
      const physicsBodyComponent = components.PhysicsBodyComponent

      if (positionComponent !== undefined) {
        vec2.copy(positionComponent.previousOffset, positionComponent.offset)

        if (physicsBodyComponent !== undefined) {
          // Calculate desired movement from velocity
          const dt = 1000 / 60
          const deltaX = physicsBodyComponent.velocity[0]! * dt * 0.5 // Halve for pixel scale
          const deltaY = physicsBodyComponent.velocity[1]! * dt * 0.5 // Halve for pixel scale

          // Get world-space collision rect
          const worldRect = rect.add(physicsBodyComponent.rect, positionComponent.offset)

          // Sweep X axis
          const finalDeltaX = this.tileCollisionService.sweepX(roomContext.physicsGrid, roomContext.roomDef.physicsTilemap.tileSize, worldRect, deltaX)
          positionComponent.offset[0]! += finalDeltaX

          // Update world rect with new X position for Y sweep
          const updatedWorldRect = rect.add(physicsBodyComponent.rect, positionComponent.offset)

          // Sweep Y axis
          const finalDeltaY = this.tileCollisionService.sweepY(roomContext.physicsGrid, roomContext.roomDef.physicsTilemap.tileSize, updatedWorldRect, deltaY)
          positionComponent.offset[1]! += finalDeltaY

          // Set collision flags
          physicsBodyComponent.touchingLeft = deltaX < 0 && Math.abs(finalDeltaX) < Math.abs(deltaX)
          physicsBodyComponent.touchingRight = deltaX > 0 && Math.abs(finalDeltaX) < Math.abs(deltaX)
          physicsBodyComponent.touchingUp = deltaY < 0 && Math.abs(finalDeltaY) < Math.abs(deltaY)
          physicsBodyComponent.touchingDown = deltaY > 0 && Math.abs(finalDeltaY) < Math.abs(deltaY)

          // Zero velocity on collision
          if (Math.abs(finalDeltaX) < Math.abs(deltaX)) {
            physicsBodyComponent.velocity[0] = 0
          }
          if (Math.abs(finalDeltaY) < Math.abs(deltaY)) {
            physicsBodyComponent.velocity[1] = 0
          }
        }
      }
    }

    // TODO: Add camera logic here (following player, bounds checking, etc.)
  }

  dispose() {
  }
}
