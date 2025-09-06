import { singleton } from "tsyringe";

import type { INpcKind } from "../npcKind";
import { ECS } from "../../ecs/ecs";
import type { EntityId, EntityComponentMap } from "../../ecs/ecs";
import type { RoomContext } from "../../roomContext";
import { AnimationController } from "../animationController";
import { assertExists } from "@/util/assertExists";
import { FacingComponent } from "@/game/ecs/components";
import { Facing } from "@/types/facing";

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
  constructor(
    private ecs: ECS,
  ) {
  }
  private npcData = new Map<EntityId, FooNpcData>()
  private animationController = new AnimationController('link')

  spawn(entityId: EntityId, spawnData: FooSpawnData): void {
    this.npcData.set(entityId, { health: spawnData.health, speed: spawnData.speed })
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'attack')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
    const data = assertExists(this.npcData.get(entityId))
    // Simple behavior: could move based on speed, take damage, etc.
    data.health = Math.max(0, data.health + 1)
    this.animationController.playAnimation(this.ecs, entityId, 'walk')
    if (data.health % 10 === 0) {
      const facingComponent = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
      facingComponent.value = facingComponent.value === Facing.LEFT ? Facing.RIGHT : Facing.LEFT
    }
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}
