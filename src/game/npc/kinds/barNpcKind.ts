import { singleton } from "tsyringe";

import type { INpcKind } from "../npcKind";
import type { EntityId , EntityComponentMap } from "../../ecs/ecs";
import type { RoomContext } from "../../roomContext";

interface BarNpcData {
  name: string
  patrolDistance: number
  currentDirection: 1 | -1
}

interface BarSpawnData {
  name: string
  patrolDistance: number
}

@singleton()
export class BarNpcKind implements INpcKind<BarSpawnData> {
  private npcData = new Map<EntityId, BarNpcData>()

  spawn(entityId: EntityId, spawnData: BarSpawnData): void {
    this.npcData.set(entityId, { 
      name: spawnData.name, 
      patrolDistance: spawnData.patrolDistance,
      currentDirection: 1
    })
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
    const data = this.npcData.get(entityId)
    if (data) {
      // Simple behavior: could patrol back and forth
      data.currentDirection = data.currentDirection === 1 ? -1 : 1
    }
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}