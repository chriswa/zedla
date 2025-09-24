import { CanvasLog } from '@/dev/canvasLog'
import { IAgentKind } from '@/game/agent/agentKind'
import { AnimationBehavior } from '@/game/agent/behaviors/animationBehavior'
import { FacingComponent, HitboxComponent, HurtboxComponent, InvulnerabilityComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { CombatBit, createCombatMask } from '@/types/combat'
import { Facing } from '@/types/facing'
import { singleton } from 'tsyringe'

interface FooNpcData {
  health: number
  speed: number
}

interface FooSpawnData {
  health: number
  speed: number
}

@singleton()
class FooEntityDataManager extends EntityDataManager<FooNpcData> {}

@singleton()
export class FooAgentKind implements IAgentKind<FooSpawnData> {
  constructor(
    private ecs: ECS,
    private fooEntityDataManager: FooEntityDataManager,
    private canvasLog: CanvasLog,
  ) {
  }

  private animationController = new AnimationBehavior('blob')

  spawn(entityId: EntityId, spawnData: FooSpawnData): void {
    this.fooEntityDataManager.onCreate(entityId, { health: spawnData.health, speed: spawnData.speed })
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'inch', 0)
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'InvulnerabilityComponent', new InvulnerabilityComponent())
  }

  tick(entityId: EntityId, components: EntityComponentMap, _roomContext: RoomContext): void {
    const data = this.fooEntityDataManager.get(entityId)
    // Mailbox: process and clear
    const mailbox = components.MailboxComponent
    if (mailbox) {
      for (const mail of mailbox.eventQueue) {
        if (mail.type === 'combat-hit') {
          // Example reaction: reduce health and face attacker
          data.health = Math.max(0, data.health - 1)
          const facing = this.ecs.getComponent(entityId, 'FacingComponent')
          facing.value = mail.attackVec2[0]! < 0 ? Facing.RIGHT : Facing.LEFT
          const attackerKind = this.ecs.maybeGetComponent(mail.attackerId, 'AgentKindComponent')?.kind ?? 'Unknown'
          this.canvasLog.postEphemeral(`Foo hurt by ${attackerKind} ${vec2.toString(mail.attackVec2)}`)
        }
      }
      mailbox.eventQueue.length = 0
    }
    // Simple idle/walk animation sample
    this.animationController.playAnimation(this.ecs, entityId, 'inch')
  }

  onDestroy(entityId: EntityId): void {
    this.fooEntityDataManager.onDestroy(entityId)
  }
}
