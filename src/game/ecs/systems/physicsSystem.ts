import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { vec2 } from "@/math/vec2";
import { Camera } from "@/gfx/camera";

const GRAVITY = 400
const TEMPORARY_GROUND_Y = 200

@scoped(Lifecycle.ContainerScoped)
export class PhysicsSystem implements ISystem, Disposable {
  constructor(
    private ecs: ECS,
    private camera: Camera,
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
          
          // Integrate velocity into position
          positionComponent.offset[0]! += physicsBodyComponent.velocity[0]! / 60
          positionComponent.offset[1]! += physicsBodyComponent.velocity[1]! / 60
          
          // Temporary ground collision
          if (positionComponent.offset[1]! >= TEMPORARY_GROUND_Y && physicsBodyComponent.velocity[1]! > 0) {
            positionComponent.offset[1] = TEMPORARY_GROUND_Y
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
