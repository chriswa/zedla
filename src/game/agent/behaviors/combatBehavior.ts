import { MailboxService } from '@/game/agent/behaviors/mailboxService'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { CombatHitMail } from '@/types/entityMail'
import { singleton } from 'tsyringe'

@singleton()
export class CombatBehavior {
  constructor(
    private ecs: ECS,
    private mailboxService: MailboxService,
  ) {}

  checkForHurt(entityId: EntityId): boolean {
    const combatHits = this.mailboxService.getMessagesOfType<CombatHitMail>(entityId, 'combat-hit')
    return combatHits.length > 0
  }

  processCombatHits(entityId: EntityId): Array<CombatHitMail> {
    return this.mailboxService.getMessagesOfType<CombatHitMail>(entityId, 'combat-hit')
  }

  applyKnockback(entityId: EntityId, velocityX: number, velocityY: number): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    body.velocity[0] = velocityX
    body.velocity[1] = velocityY
  }
}
