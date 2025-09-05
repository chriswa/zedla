import type { EntityId } from "../ecs/ecs";
import type { RoomContext } from "../roomContext";
import type { EntityComponentMap } from "../ecs/ecs";

export interface INpcKind<TSpawnData = void> {
  spawn(entityId: EntityId, spawnData: TSpawnData): void
  tick(entityId: EntityId, components: EntityComponentMap, roomContext: RoomContext): void
  onDestroy?(entityId: EntityId): void
}