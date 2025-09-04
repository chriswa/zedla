import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { ECS } from "../ecs/ecs";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { AnimationComponent, PositionComponent, SpriteComponent, PhysicsBodyComponent } from "../ecs/components";
import { vec2 } from "@/math/vec2";
import { rect } from "@/math/rect";
import { imageSliceDefs } from "@/resources/imageSliceDefs";
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
    ecs.addComponent(playerEntityId, 'PositionComponent', new PositionComponent(vec2.create(16, 16)))
    ecs.addComponent(playerEntityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-8, -32, 8, 0), vec2.zero()))
    ecs.addComponent(playerEntityId, 'SpriteComponent', new SpriteComponent(imageSliceDefs.link_walk_0))
    ecs.addComponent(playerEntityId, 'AnimationComponent', new AnimationComponent(animationDefs.link, animationDefs.link.walk))
  }
  tick() {
    this.playerSystem.tick()
    this.npcSystem.tick()
    this.physicsSystem.tick()
    this.animationSystem.tick()
  }
  render(renderBlend: number) {
    this.renderSystem.render(renderBlend)
  }
  dispose() {
  }
}
