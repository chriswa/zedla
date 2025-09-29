import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { InvulnerabilityBehavior } from '@/game/agent/behaviors/invulnerabilityBehavior'
import { MailboxService } from '@/game/agent/behaviors/mailboxService'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { Facing } from '@/types/facing'
import { InvulnerabilityBit } from '@/types/invulnerability'
import { assertExists } from '@/util/assertExists'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

const HURT_IMPULSE_X = 0.15000
const HURT_IMPULSE_Y = 0.40000
const HURT_TICKS = Math.round(0.4 * 60) // ~400ms

@singleton()
export class HurtStrategy implements FsmStrategy<EntityId, PlayerStrategyFsmClassMapKeys> {
  private info = new Map<EntityId, { ticks: number }>()

  constructor(
    private ecs: ECS,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private mailboxService: MailboxService,
    private combatBehavior: CombatBehavior,
    private invulnerabilityBehavior: InvulnerabilityBehavior,
  ) {}

  onEnter(entityId: EntityId): void {
    // Process combat-hit mail from mailbox
    const combatHits = this.mailboxService.getMessagesOfType(entityId, 'combat-hit')
    if (combatHits.length > 0) {
      const facing = this.ecs.getComponent(entityId, 'FacingComponent')
      // Knockback opposite to player's facing direction
      const velocityX = facing.value === Facing.RIGHT ? -HURT_IMPULSE_X : HURT_IMPULSE_X
      this.combatBehavior.applyKnockback(entityId, velocityX, -HURT_IMPULSE_Y)
      this.info.set(entityId, { ticks: HURT_TICKS })
    }
    this.mailboxService.clearMailbox(entityId)

    // Set invulnerable during hurt state
    this.invulnerabilityBehavior.setInvulnerable(entityId, InvulnerabilityBit.HURT)

    // Set hurt animation
    this.playerAnimationBehavior.startAnimation(this.ecs, entityId, 'hurt')
  }

  onExit(entityId: EntityId): void {
    // Clear hurt invulnerability when leaving hurt state
    this.invulnerabilityBehavior.clearInvulnerable(entityId, InvulnerabilityBit.HURT)

    // Clean up map entry
    this.info.delete(entityId)
  }

  update(entityId: EntityId): PlayerStrategyFsmClassMapKeys | undefined {
    const rec = assertExists(this.info.get(entityId))
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Apply gravity during hurt state
    const dt = 1000 / 60
    body.velocity[1]! += 0.00400 * dt

    rec.ticks -= 1
    if (rec.ticks <= 0) {
      // Check ground contact to determine next state
      return body.touchingDown ? 'GroundedStrategy' : 'AirborneStrategy'
    }

    return undefined
  }
}
