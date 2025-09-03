import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { vec3 } from "@/math/vec3";
import { Camera } from "@/gfx/camera";

@scoped(Lifecycle.ContainerScoped)
export class PhysicsSystem implements ISystem, Disposable {
  constructor(
    private ecs: ECS,
    private camera: Camera,
  ) {
  }
  tick() {
    // Store previous positions before updating current positions
    vec3.setVec3(this.camera.previousOffset, this.camera.offset)
    
    this.ecs.entities.forEach((components, _entityId) => {
      const positionComponent = components.PositionComponent
      if (positionComponent !== undefined) {
        vec3.setVec3(positionComponent.previousOffset, positionComponent.offset)
        
        // TODO: Add actual physics logic here (velocity integration, collision detection, etc.)
      }
    })
    
    // TODO: Add camera logic here (following player, bounds checking, etc.)
  }
  dispose() {
  }
}
