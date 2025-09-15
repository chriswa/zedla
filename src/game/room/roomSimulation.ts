import { ECS } from '@/game/ecs/ecs'
import { AgentSystem } from '@/game/ecs/systems/agentSystem'
import { AnimationSystem } from '@/game/ecs/systems/animationSystem'
import { CameraSystem } from '@/game/ecs/systems/cameraSystem'
import { CombatCollisionSystem } from '@/game/ecs/systems/combatCollisionSystem'
import { PhysicsSystem } from '@/game/ecs/systems/physicsSystem'
import { RenderSystem } from '@/game/ecs/systems/renderSystem'
import { RoomContext } from '@/game/roomContext'
import { vec2 } from '@/math/vec2'
import { RoomDef } from '@/types/roomDef'
import { singleton } from 'tsyringe'

@singleton()
export class RoomSimulation {
  constructor(
    private ecs: ECS,
    private agentSystem: AgentSystem,
    private physicsSystem: PhysicsSystem,
    private cameraSystem: CameraSystem,
    private animationSystem: AnimationSystem,
    private combatCollisionSystem: CombatCollisionSystem,
    private renderSystem: RenderSystem,
  ) {
  }

  initializeRoomContext(roomDef: RoomDef): RoomContext {
    const sceneId = this.ecs.allocateSceneId()
    const roomContext = new RoomContext(sceneId, roomDef)

    const playerEntityId = this.agentSystem.spawnAgent(sceneId, 'Player', vec2.create(64, 64), {})
    roomContext.setPlayerEntityId(playerEntityId)

    for (const spawn of roomDef.spawns) {
      this.agentSystem.spawnAgent(sceneId, spawn.kind, spawn.position, spawn.spawnData)
    }

    return roomContext
  }

  tick(roomContext: RoomContext) {
    this.agentSystem.tick(roomContext)
    this.physicsSystem.tick(roomContext)
    this.combatCollisionSystem.tick(roomContext)
    this.animationSystem.tick(roomContext)
    this.cameraSystem.tick(roomContext)
  }

  render(renderBlend: number, roomContext: RoomContext) {
    this.renderSystem.render(renderBlend, roomContext)
  }
}
