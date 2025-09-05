import { singleton } from "tsyringe";
import type { INpcKind } from "./npcKind";
import type { EntityId } from "../ecs/ecs";
import type { RoomContext } from "../roomContext";
import type { EntityComponentMap } from "../ecs/ecs";

interface FooNpcData {
  health: number
  speed: number
}

interface FooSpawnData {
  health: number
  speed: number
}

@singleton()
export class FooNpcKind implements INpcKind<FooSpawnData> {
  private npcData = new Map<EntityId, FooNpcData>()

  spawn(entityId: EntityId, spawnData: FooSpawnData): void {
    this.npcData.set(entityId, { health: spawnData.health, speed: spawnData.speed })
  }

  tick(entityId: EntityId, components: EntityComponentMap, roomContext: RoomContext): void {
    const data = this.npcData.get(entityId)
    if (data) {
      // Simple behavior: could move based on speed, take damage, etc.
      data.health = Math.max(0, data.health - 1) // Slowly lose health
    }
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}