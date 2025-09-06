import { singleton } from "tsyringe";

import type { INpcKind } from "../npcKind";
import { ECS } from "../../ecs/ecs";
import type { EntityId, EntityComponentMap } from "../../ecs/ecs";
import type { RoomContext } from "../../roomContext";
import { FacingComponent } from "@/game/ecs/components";
import { Facing } from "@/types/facing";

interface BarNpcData {
  name: string
  patrolDistance: number
}

interface BarSpawnData {
  name: string
  patrolDistance: number
}

@singleton()
export class BarNpcKind implements INpcKind<BarSpawnData> {
  constructor(
    private ecs: ECS,
  ) {}
  private npcData = new Map<EntityId, BarNpcData>()

  spawn(entityId: EntityId, spawnData: BarSpawnData): void {
    this.npcData.set(entityId, { 
      name: spawnData.name, 
      patrolDistance: spawnData.patrolDistance,
    })
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}
