import { singleton } from "tsyringe";

import { ECS } from "../../ecs/ecs";

import type { EntityId, EntityComponentMap } from "../../ecs/ecs";
import type { RoomContext } from "../../roomContext";
import type { IAgentKind } from "../agentKind";

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
export class BarAgentKind implements IAgentKind<BarSpawnData> {
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

  tick(_entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
    // Example: consume and clear mailbox (no reaction yet)
    const mailbox = _components.MailboxComponent
    if (mailbox) mailbox.eventQueue.length = 0
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}
