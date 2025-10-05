import { EntityId } from '@/game/ecs/ecs'
import { assertExists } from '@/util/assertExists'

export class EntityDataMap<T> {
  private map = new Map<EntityId, T>()

  maybeGet(entityId: EntityId): T | undefined {
    return this.map.get(entityId)
  }

  get(entityId: EntityId): T {
    return assertExists(this.map.get(entityId))
  }

  set(entityId: EntityId, data: T): void {
    this.map.set(entityId, data)
  }

  delete(entityId: EntityId): void {
    this.map.delete(entityId)
  }
}
