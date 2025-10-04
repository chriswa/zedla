import { CanvasLog } from '@/dev/canvasLog'
import { AgentContext } from '@/game/agent/agentContext'
import { BaseAgentKind } from '@/game/agent/baseAgentKind'
import { AnimationBehavior } from '@/game/agent/behaviors/animationBehavior'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { MailboxService } from '@/game/agent/behaviors/mailboxService'
import { FacingComponent, HitboxComponent, HurtboxComponent, InvulnerabilityComponent } from '@/game/ecs/components'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { EntityDataMap } from '@/game/ecs/entityDataMap'
import { rect } from '@/math/rect'
import { CombatBit, createCombatMask } from '@/types/combat'
import { Facing } from '@/types/facing'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

interface FooSpawnData {
  health: number
  speed: number
}

interface FooEntityData {
  health: number
  speed: number
}

@singleton()
class FooEntityDataMap extends EntityDataMap<FooEntityData> {}

const animationName = 'blob'
@singleton()
class FooAnimationBehavior extends AnimationBehavior<typeof animationName> {
  constructor() { super(animationName) }
}

@singleton()
class FooIdleStrategy implements FsmStrategy<AgentContext, keyof typeof fooStrategyFsmClassMap> {
  constructor(
    private combatBehavior: CombatBehavior,
    private mailboxService: MailboxService,
    private canvasLog: CanvasLog,
  ) {}

  update(agentContext: AgentContext): keyof typeof fooStrategyFsmClassMap | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) {
      this.canvasLog.postEphemeral('Foo: ouch!')
      this.mailboxService.clearMailbox(entityId)
    }
    return undefined
  }

  onEnter(_agentContext: AgentContext): void {}
  onExit(_agentContext: AgentContext): void {}
}

const fooStrategyFsmClassMap = {
  FooIdleStrategy,
} as const

@singleton()
export class FooAgentKind extends BaseAgentKind<FooSpawnData, typeof fooStrategyFsmClassMap> {
  constructor(
    ecs: ECS,
    private animationBehavior: FooAnimationBehavior,
    private entityDataMap: FooEntityDataMap,
  ) {
    super(ecs, fooStrategyFsmClassMap, 'FooIdleStrategy', [])
  }

  protected addComponents(entityId: EntityId, _spawnData: FooSpawnData): void {
    this.animationBehavior.addSpriteAndAnimationComponents(this.ecs, entityId, 'inch', 0)
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.createFromCorners(-8, -13, 8, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'InvulnerabilityComponent', new InvulnerabilityComponent())
  }

  protected override afterSpawn(entityId: EntityId, spawnData: FooSpawnData): void {
    this.entityDataMap.set(entityId, { health: spawnData.health, speed: spawnData.speed })
  }

  protected override beforeDestroy(entityId: EntityId): void {
    this.entityDataMap.delete(entityId)
  }
}
