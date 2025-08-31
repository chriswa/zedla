import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { ECS, type EntityId } from "../ecs/ecs";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { AnimationComponent, PositionComponent, SpriteComponent } from "../ecs/components";
import { vec3 } from "@/math/vec3";
import { imageSliceDefs } from "@/resources/imageSliceDefs";
import { assertExists } from "@/util/assertExists";
import { animationDefs } from "@/resources/animationDefs";

@scoped(Lifecycle.ContainerScoped)
export class RoomSimulation implements Disposable {
  private testEntityId: EntityId
  constructor(
    @inject(RoomDefToken) private roomDef: RoomDef,
    private ecs: ECS,
    private physicsSystem: PhysicsSystem,
    private animationSystem: AnimationSystem,
    private renderSystem: RenderSystem,
  ) {
    this.testEntityId = ecs.createEntity()
    ecs.addComponent(this.testEntityId, 'PositionComponent', new PositionComponent(vec3.create(16, 16, 0)))
    ecs.addComponent(this.testEntityId, 'SpriteComponent', new SpriteComponent(imageSliceDefs.link_walk_0))
    ecs.addComponent(this.testEntityId, 'AnimationComponent', new AnimationComponent(animationDefs.link, animationDefs.link.walk))
  }
  tick() {
    
    const positionComponent = assertExists(this.ecs.getComponent(this.testEntityId, 'PositionComponent'))
    positionComponent.offset[0]! += 1

    this.physicsSystem.tick()
    this.animationSystem.tick()
  }
  render() {
    this.renderSystem.render()
  }
  dispose() {
  }
}
