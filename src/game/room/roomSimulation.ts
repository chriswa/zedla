import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";

import { PositionComponent, AgentKindComponent, MailboxComponent } from "../ecs/components";
import { ECS, type EntityId } from "../ecs/ecs";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { CameraSystem } from "../ecs/systems/cameraSystem";
import { AgentSystem } from "../ecs/systems/agentSystem";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { CombatCollisionSystem } from "../ecs/systems/combatCollisionSystem";
import { GameStrategy } from "../gameStrategy";
import { spawnAgentByKind, type AgentKindKey, type AgentSpawnData } from "../agent/agentKindRegistry";
import { CanvasLog } from "@/dev/canvasLog";
import { RoomContext } from "../roomContext";

import { vec2, type Vec2 } from "@/math/vec2";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import { Grid2D } from "@/util/grid2D";


@scoped(Lifecycle.ContainerScoped)
export class RoomSimulation extends GameStrategy implements Disposable {
  constructor(
    @inject(RoomDefToken) roomDef: RoomDef,
    private ecs: ECS,
    private roomContext: RoomContext,
    private agentSystem: AgentSystem,
    private physicsSystem: PhysicsSystem,
    private cameraSystem: CameraSystem,
    private animationSystem: AnimationSystem,
    private combatCollisionSystem: CombatCollisionSystem,
    private renderSystem: RenderSystem,
    private canvasLog: CanvasLog,
  ) {
    super()
    
    // Initialize RoomContext grids
    this.roomContext.roomDef = roomDef
    this.roomContext.physicsGrid = new Grid2D(roomDef.physicsTilemap.tiles, roomDef.physicsTilemap.cols)
    this.roomContext.backgroundGrids = roomDef.backgroundTilemaps.map(bg => new Grid2D(bg.tiles, bg.cols))
    
    // Spawn Agents
    for (const spawn of roomDef.spawns) {
      createAgentEntity(this.ecs, spawn.kind, spawn.position, spawn.spawnData)
    }

    this.roomContext.playerEntityId = createAgentEntity(this.ecs, 'Player', vec2.create(64, 64), {})

    // Dev: initial hello world ephemeral message
    this.canvasLog.postEphemeral('Hello World!')
  }

  tick() {
    this.agentSystem.tick()
    this.physicsSystem.tick()
    this.cameraSystem.tick()
    this.combatCollisionSystem.tick()
    this.animationSystem.tick()
  }
  render(renderBlend: number) {
    this.renderSystem.render(renderBlend)
  }
  dispose() {
  }
}

function createAgentEntity<K extends AgentKindKey>(
  ecs: ECS,
  agentKind: K,
  position: Vec2,
  spawnData: AgentSpawnData[K],
): EntityId {
  const entityId = ecs.createEntity()
  ecs.addComponent(entityId, 'PositionComponent', new PositionComponent(position))
  ecs.addComponent(entityId, 'AgentKindComponent', new AgentKindComponent(agentKind))
  ecs.addComponent(entityId, 'MailboxComponent', new MailboxComponent())
  spawnAgentByKind(entityId, agentKind, spawnData)
  return entityId
}
