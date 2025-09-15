import { CanvasLog } from '@/dev/canvasLog'
import { AgentKindKey, AgentSpawnData, spawnAgentByKind } from '@/game/agent/agentKindRegistry'
import { AgentKindComponent, MailboxComponent, PositionComponent } from '@/game/ecs/components'
import { ECS, EntityId, SceneId } from '@/game/ecs/ecs'
import { AgentSystem } from '@/game/ecs/systems/agentSystem'
import { AnimationSystem } from '@/game/ecs/systems/animationSystem'
import { CameraSystem } from '@/game/ecs/systems/cameraSystem'
import { CombatCollisionSystem } from '@/game/ecs/systems/combatCollisionSystem'
import { PhysicsSystem } from '@/game/ecs/systems/physicsSystem'
import { RenderSystem } from '@/game/ecs/systems/renderSystem'
import { RoomContext } from '@/game/roomContext'
import { Vec2, vec2 } from '@/math/vec2'
import { RoomDef } from '@/types/roomDef'
import { Disposable, singleton } from 'tsyringe'

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
    const sceneId = this.ecs.allocateSceneId()
    const roomContext = new RoomContext(sceneId, roomDef)

    const playerEntityId = createAgentEntity(this.ecs, sceneId, 'Player', vec2.create(64, 64), {})
    roomContext.setPlayerEntityId(playerEntityId)

    // Spawn Agents
    for (const spawn of roomDef.spawns) {
      createAgentEntity(this.ecs, sceneId, spawn.kind, spawn.position, spawn.spawnData)
    }

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
  sceneId: SceneId,
  agentKind: K,
  position: Vec2,
  spawnData: AgentSpawnData[K],
): EntityId {
  const entityId = ecs.createEntity(sceneId)
  ecs.addComponent(entityId, 'PositionComponent', new PositionComponent(position))
  ecs.addComponent(entityId, 'AgentKindComponent', new AgentKindComponent(agentKind))
  ecs.addComponent(entityId, 'MailboxComponent', new MailboxComponent())
  spawnAgentByKind(entityId, agentKind, spawnData)
  return entityId
}
