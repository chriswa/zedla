import { singleton } from "tsyringe";

import { ECS } from "../../ecs/ecs";
import { AnimationController } from "../animationController";

import type { EntityId, EntityComponentMap } from "../../ecs/ecs";
import type { RoomContext } from "../../roomContext";
import type { IAgentKind } from "../agentKind";

import { CanvasLog } from "@/dev/canvasLog";
import { FacingComponent, HitboxComponent, HurtboxComponent } from "@/game/ecs/components";
import { rect } from "@/math/rect";
import { vec2 } from "@/math/vec2";
import { CombatBit, createCombatMask } from "@/types/combat";
import { Facing } from "@/types/facing";
import { assertExists } from "@/util/assertExists";

interface FooNpcData {
  health: number
  speed: number
}

interface FooSpawnData {
  health: number
  speed: number
}

@singleton()
export class FooAgentKind implements IAgentKind<FooSpawnData> {
  constructor(
    private ecs: ECS,
    private canvasLog: CanvasLog,
  ) {
  }
  private npcData = new Map<EntityId, FooNpcData>()
  private animationController = new AnimationController('blob')

  spawn(entityId: EntityId, spawnData: FooSpawnData): void {
    this.npcData.set(entityId, { health: spawnData.health, speed: spawnData.speed })
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'inch')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
  }

  tick(entityId: EntityId, components: EntityComponentMap, _roomContext: RoomContext): void {
    const data = assertExists(this.npcData.get(entityId))
    // Mailbox: process and clear
    const mailbox = components.MailboxComponent
    if (mailbox) {
      for (const mail of mailbox.eventQueue) {
        if (mail.type === 'combat-hit') {
          // Example reaction: reduce health and face attacker
          data.health = Math.max(0, data.health - 1)
          const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
          facing.value = mail.attackVec2[0]! < 0 ? Facing.RIGHT : Facing.LEFT
          const attackerKind = this.ecs.getComponent(mail.attackerId, 'AgentKindComponent')?.kind ?? 'Unknown'
          this.canvasLog.postEphemeral(`Foo hurt by ${String(attackerKind)} ${vec2.toString(mail.attackVec2)}`)
        }
      }
      mailbox.eventQueue.length = 0
    }
    // Simple idle/walk animation sample
    this.animationController.playAnimation(this.ecs, entityId, 'inch')
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}
