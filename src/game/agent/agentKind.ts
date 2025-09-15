import { EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { RoomContext } from '@/game/roomContext'

export interface IAgentKind<TSpawnData = void> {
  spawn(entityId: EntityId, spawnData: TSpawnData): void
  tick(entityId: EntityId, components: EntityComponentMap, roomContext: RoomContext): void
  onDestroy(entityId: EntityId): void
}
