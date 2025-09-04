import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { vec2 } from "@/math/vec2";
import { rect } from "@/math/rect";
import { Camera } from "@/gfx/camera";
import { TileCollisionService } from "../../collision/tileCollisionService";

const GRAVITY = 100

@scoped(Lifecycle.ContainerScoped)
export class PhysicsSystem implements ISystem, Disposable {
  constructor(
    private ecs: ECS,
    private camera: Camera,
    private tileCollisionService: TileCollisionService,
  ) {
  }
  tick() {
    // Store previous positions before updating current positions
    vec2.copy(this.camera.previousOffset, this.camera.offset)
    
    this.ecs.entities.forEach((components, _entityId) => {
      const positionComponent = components.PositionComponent
      const physicsBodyComponent = components.PhysicsBodyComponent
      
      if (positionComponent !== undefined) {
        vec2.copy(positionComponent.previousOffset, positionComponent.offset)
        
        if (physicsBodyComponent !== undefined) {
          // Apply gravity
          physicsBodyComponent.velocity[1]! += GRAVITY / 60 // Assuming 60 FPS
          
          // Calculate desired movement
          const deltaX = physicsBodyComponent.velocity[0]! / 60
          const deltaY = physicsBodyComponent.velocity[1]! / 60
          
          // Get world-space collision rect
          const worldRect = rect.add(physicsBodyComponent.rect, positionComponent.offset)
          
          // Sweep X axis
          const finalDeltaX = this.tileCollisionService.sweepX(worldRect, deltaX)
          positionComponent.offset[0]! += finalDeltaX
          
          // Update world rect with new X position for Y sweep
          const updatedWorldRect = rect.add(physicsBodyComponent.rect, positionComponent.offset)
          
          // Sweep Y axis
          const finalDeltaY = this.tileCollisionService.sweepY(updatedWorldRect, deltaY)
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
    })
    
    // TODO: Add camera logic here (following player, bounds checking, etc.)
  }
  dispose() {
  }
}
