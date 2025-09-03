import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { ECS, type EntityId } from "../ecs/ecs";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { AnimationComponent, PositionComponent, SpriteComponent } from "../ecs/components";
import { vec3 } from "@/math/vec3";
import { imageSliceDefs } from "@/resources/imageSliceDefs";
import { assertExists } from "@/util/assertExists";
import { animationDefs } from "@/resources/animationDefs";
import { GameStrategy } from "../gameStrategy";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import { PlayerSystem } from "../ecs/systems/playerSystem";
import { NpcSystem } from "../ecs/systems/npcSystem";
import { RoomContext } from "../roomContext";
import { Camera } from "@/gfx/camera";

@scoped(Lifecycle.ContainerScoped)
export class RoomSimulation extends GameStrategy implements Disposable {
  constructor(
    @inject(RoomDefToken) private roomDef: RoomDef,
    private ecs: ECS,
    private roomContext: RoomContext,
    private playerSystem: PlayerSystem,
    private npcSystem: NpcSystem,
    private physicsSystem: PhysicsSystem,
    private animationSystem: AnimationSystem,
    private renderSystem: RenderSystem,

    private camera: Camera,
  ) {
    super()
    this.roomContext.playerEntityId = ecs.createEntity()
    const playerEntityId = this.roomContext.playerEntityId
    ecs.addComponent(playerEntityId, 'PositionComponent', new PositionComponent(vec3.create(16, 16, 0)))
    ecs.addComponent(playerEntityId, 'SpriteComponent', new SpriteComponent(imageSliceDefs.link_walk_0))
    ecs.addComponent(playerEntityId, 'AnimationComponent', new AnimationComponent(animationDefs.link, animationDefs.link.walk))
  }
  tick() {
    
    this.playerSystem.tick()
    this.npcSystem.tick()
    this.physicsSystem.tick()

    const positionComponent = assertExists(this.ecs.getComponent(this.roomContext.playerEntityId, 'PositionComponent'))
    positionComponent.offset[0]! += 1

    this.camera.offset[0]! += 1


    this.animationSystem.tick()
  }
  render(renderBlend: number) {
    this.renderSystem.render(renderBlend)
  }
  dispose() {
  }
}
