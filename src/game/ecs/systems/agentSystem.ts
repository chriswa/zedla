import { agentKindRegistry } from '@/game/agent/agentKindRegistry'
import { AgentKindComponent } from '@/game/ecs/components'
import { ECS } from '@/game/ecs/ecs'
import { ITickingSystem } from '@/game/ecs/systems/types'
import { GameEventBus } from '@/game/event/gameEventBus'
import { RoomContext } from '@/game/roomContext'
import { Disposable, singleton } from 'tsyringe'

@singleton()
export class AgentSystem implements ITickingSystem, Disposable {
  private unsubscribeFromEvents: () => void

  constructor(
    private ecs: ECS,
    private gameEventBus: GameEventBus,
  ) {
    this.unsubscribeFromEvents = this.gameEventBus.on('ecs:component_removing', (entityId, componentKey, component) => {
      if (componentKey === 'AgentKindComponent') {
        const agentKindComponent = component as AgentKindComponent
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.onDestroy(entityId)
      }
    })
  }

  tick(roomContext: RoomContext) {
    for (const [entityId, components] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
      const agentKindComponent = components.AgentKindComponent
      if (agentKindComponent) {
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.tick(entityId, components, roomContext)
      }
    }
  }

  dispose() {
    this.unsubscribeFromEvents()
  }
}
