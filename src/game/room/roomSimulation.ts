import { singleton, type Disposable } from "tsyringe";

import { spawnAgentByKind, type AgentKindKey, type AgentSpawnData } from "../agent/agentKindRegistry";
import { PositionComponent, AgentKindComponent, MailboxComponent } from "../ecs/components";
import { ECS, type EntityId, type ShardId } from "../ecs/ecs";
import { AgentSystem } from "../ecs/systems/agentSystem";
import { AnimationSystem } from "../ecs/systems/animationSystem";
import { CameraSystem } from "../ecs/systems/cameraSystem";
import { CombatCollisionSystem } from "../ecs/systems/combatCollisionSystem";
import { PhysicsSystem } from "../ecs/systems/physicsSystem";
import { RenderSystem } from "../ecs/systems/renderSystem";
import { RoomContext } from "../roomContext";

import { CanvasLog } from "@/dev/canvasLog";
import { vec2, type Vec2 } from "@/math/vec2";
import { type RoomDef } from "@/types/roomDef";
import { Grid2D } from "@/util/grid2D";


@singleton()
export class RoomSimulation implements Disposable {
  constructor(
    private ecs: ECS,
    private agentSystem: AgentSystem,
    private physicsSystem: PhysicsSystem,
    private cameraSystem: CameraSystem,
    private animationSystem: AnimationSystem,
    private combatCollisionSystem: CombatCollisionSystem,
    private renderSystem: RenderSystem,
    private canvasLog: CanvasLog,
  ) {
  }

  createRoomContext(roomDef: RoomDef): RoomContext {
    const shardId = this.ecs.allocateShardId()
    const roomContext = new RoomContext(shardId)

    // Initialize RoomContext grids
    roomContext.roomDef = roomDef
    roomContext.physicsGrid = new Grid2D(roomDef.physicsTilemap.tiles, roomDef.physicsTilemap.cols)
    roomContext.backgroundGrids = roomDef.backgroundTilemaps.map(bg => new Grid2D(bg.tiles, bg.cols))

    // Spawn Agents
    for (const spawn of roomDef.spawns) {
      createAgentEntity(this.ecs, shardId, spawn.kind, spawn.position, spawn.spawnData)
    }

    roomContext.playerEntityId = createAgentEntity(this.ecs, shardId, 'Player', vec2.create(64, 64), {})

    // Dev: initial hello world ephemeral message
    this.canvasLog.postEphemeral('Hello World!')

    return roomContext
  }

  tick(roomContext: RoomContext) {
    this.agentSystem.tick(roomContext)
    this.physicsSystem.tick(roomContext)
    this.cameraSystem.tick(roomContext)
    this.combatCollisionSystem.tick(roomContext)
    this.animationSystem.tick(roomContext)
  }
  render(renderBlend: number, roomContext: RoomContext) {
    this.renderSystem.render(renderBlend, roomContext)
  }
  dispose() {
  }
}

function createAgentEntity<K extends AgentKindKey>(
  ecs: ECS,
  shardId: ShardId,
  agentKind: K,
  position: Vec2,
  spawnData: AgentSpawnData[K],
): EntityId {
  const entityId = ecs.createEntity(shardId)
  ecs.addComponent(entityId, 'PositionComponent', new PositionComponent(position))
  ecs.addComponent(entityId, 'AgentKindComponent', new AgentKindComponent(agentKind))
  ecs.addComponent(entityId, 'MailboxComponent', new MailboxComponent())
  spawnAgentByKind(entityId, agentKind, spawnData)
  return entityId
}
