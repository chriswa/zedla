import { EntityId } from '@/game/ecs/ecs'
import { assertExists } from '@/util/assertExists'

export class EntityDataManager<T> {
  private map = new Map<EntityId, T>()

  set(entityId: EntityId, data: T): void {
    this.map.set(entityId, data)
  }

  get(entityId: EntityId): T {
    return assertExists(this.map.get(entityId))
  }

  onCreate(entityId: EntityId, data: T): void {
    this.set(entityId, data)
  }

  onDestroy(entityId: EntityId): void {
    this.map.delete(entityId)
  }
}
