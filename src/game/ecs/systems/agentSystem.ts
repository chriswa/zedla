import { AgentKindKey, AgentKindResolver, AgentSpawnData } from '@/game/agent/agentKindResolver'
import { AgentKindComponent, MailboxComponent, PositionComponent } from '@/game/ecs/components'
import { ECS, EntityId, SceneId } from '@/game/ecs/ecs'
import { ITickingSystem } from '@/game/ecs/systems/types'
import { GameEventBus } from '@/game/event/gameEventBus'
import { RoomContext } from '@/game/roomContext'
import { Vec2 } from '@/math/vec2'
import { singleton } from 'tsyringe'

@singleton()
export class AgentSystem implements ITickingSystem {
  constructor(
    private ecs: ECS,
    private gameEventBus: GameEventBus,
    private agentKindResolver: AgentKindResolver,
  ) {
    this.gameEventBus.on('ecs:component_removing', (entityId, componentKey, component) => {
      if (componentKey === 'AgentKindComponent') {
        const agentKindComponent = component as AgentKindComponent
        const agentKind = this.agentKindResolver.resolve(agentKindComponent.kind)
        agentKind.onDestroy(entityId)
      }
    })
  }

  tick(roomContext: RoomContext) {
    for (const [entityId, components] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
      const agentKindComponent = components.AgentKindComponent
      if (agentKindComponent) {
        const agentKind = this.agentKindResolver.resolve(agentKindComponent.kind)
        agentKind.tick(entityId, components, roomContext)
      }
    }
  }

  spawnAgent<K extends AgentKindKey>(
    sceneId: SceneId,
    agentKind: K,
    position: Vec2,
    spawnData: AgentSpawnData[K],
  ): EntityId {
    const entityId = this.ecs.createEntity(sceneId)
    this.ecs.addComponent(entityId, 'PositionComponent', new PositionComponent(position))
    this.ecs.addComponent(entityId, 'AgentKindComponent', new AgentKindComponent(agentKind))
    this.ecs.addComponent(entityId, 'MailboxComponent', new MailboxComponent())
    this.agentKindResolver.spawnAgent(entityId, agentKind, spawnData)
    return entityId
  }
}
