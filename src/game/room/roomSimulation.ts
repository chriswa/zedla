import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";

import { AnimationComponent, PositionComponent, SpriteComponent, PhysicsBodyComponent, NpcKindComponent } from "../ecs/components";
import { ECS } from "../ecs/ecs";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { CameraSystem } from "../ecs/systems/cameraSystem";
import { NpcSystem } from "../ecs/systems/npcSystem";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { PlayerSystem } from "../ecs/systems/playerSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { GameStrategy } from "../gameStrategy";
import { spawnNpcByKind } from "../npc/npcKindRegistry";
import { RoomContext } from "../roomContext";

import { rect } from "@/math/rect";
import { vec2 } from "@/math/vec2";
import { animationDefs } from "@/resources/animationDefs";
import { imageSliceDefs } from "@/resources/imageSliceDefs";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import { Grid2D } from "@/util/grid2D";


@scoped(Lifecycle.ContainerScoped)
export class RoomSimulation extends GameStrategy implements Disposable {
  constructor(
    @inject(RoomDefToken) roomDef: RoomDef,
    ecs: ECS,
    private roomContext: RoomContext,
    private playerSystem: PlayerSystem,
    private npcSystem: NpcSystem,
    private physicsSystem: PhysicsSystem,
    private cameraSystem: CameraSystem,
    private animationSystem: AnimationSystem,
    private renderSystem: RenderSystem,
  ) {
    super()
    
    // Initialize RoomContext grids
    this.roomContext.roomDef = roomDef
    this.roomContext.physicsGrid = new Grid2D(roomDef.physicsTilemap.tiles, roomDef.physicsTilemap.cols)
    this.roomContext.backgroundGrids = roomDef.backgroundTilemaps.map(bg => new Grid2D(bg.tiles, bg.cols))
    
    this.roomContext.playerEntityId = ecs.createEntity()
    const playerEntityId = this.roomContext.playerEntityId
    ecs.addComponent(playerEntityId, 'PositionComponent', new PositionComponent(vec2.create(64, 64)))
    ecs.addComponent(playerEntityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-8, -32, 8, 0), vec2.zero()))
    ecs.addComponent(playerEntityId, 'SpriteComponent', new SpriteComponent(imageSliceDefs.link_walk_0))
    ecs.addComponent(playerEntityId, 'AnimationComponent', new AnimationComponent(animationDefs.link, animationDefs.link.walk))
    
    // Spawn NPCs
    for (const spawn of roomDef.spawns) {
      const npcEntityId = ecs.createEntity()
      ecs.addComponent(npcEntityId, 'PositionComponent', new PositionComponent(spawn.position))
      ecs.addComponent(npcEntityId, 'NpcKindComponent', new NpcKindComponent(spawn.kind))
      
      // Call kind-specific spawn method
      spawnNpcByKind(npcEntityId, spawn.kind, spawn.spawnData)
    }
  }

  tick() {
    this.playerSystem.tick()
    this.npcSystem.tick()
    this.physicsSystem.tick()
    this.cameraSystem.tick()
    this.animationSystem.tick()
  }
  render(renderBlend: number) {
    this.renderSystem.render(renderBlend)
  }
  dispose() {
  }
}
