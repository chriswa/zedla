import type { EntityId , EntityComponentMap } from "../ecs/ecs";
import type { RoomContext } from "../roomContext";

export interface IAgentKind<TSpawnData = void> {
  spawn(entityId: EntityId, spawnData: TSpawnData): void
  tick(entityId: EntityId, components: EntityComponentMap, roomContext: RoomContext): void
  onDestroy(entityId: EntityId): void
}
