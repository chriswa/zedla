import { AgentContext } from '@/game/agent/agentContext'
import { AgentLifecycleConsumer } from '@/game/agent/agentLifecycleConsumer'
import { EntityId } from '@/game/ecs/ecs'
import { EntityDataMap } from '@/game/ecs/entityDataMap'
import { assertExists } from '@/util/assertExists'

export abstract class StatefulAgentBehavior<T> implements AgentLifecycleConsumer {
  constructor(
    private entityDataMap: EntityDataMap<T>,
  ) {}

  afterSpawn(entityId: EntityId): void {
    this.entityDataMap.set(entityId, this.createInitialEntityData())
  }

  beforeDestroy(entityId: EntityId): void {
    this.entityDataMap.delete(entityId)
  }

  protected getData(agentContext: AgentContext): T {
    return assertExists(
      this.entityDataMap.maybeGet(agentContext.entityId),
      `${this.constructor.name} was not registered as a lifecycle consumer. Add it to the BaseAgentKind constructor's lifecycleEventConsumers array.`,
    )
  }

  protected abstract createInitialEntityData(): T
}
