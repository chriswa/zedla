import { EntityId } from '../ecs/ecs'

export interface AgentLifecycleConsumer {
  afterSpawn(entityId: EntityId): void

  beforeDestroy(entityId: EntityId): void
}
