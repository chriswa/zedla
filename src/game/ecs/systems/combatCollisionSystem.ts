import { singleton, type Disposable } from 'tsyringe'

import { ECS } from '../ecs'

import type { EntityMail } from '@/types/entityMail'

import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { masksOverlap } from '@/types/combat'
import { assertExists } from '@/util/assertExists'

@singleton()
export class CombatCollisionSystem implements Disposable {
  constructor(
    private ecs: ECS,
  ) {}

  tick(roomContext: RoomContext) {
    // Iterate all entities with hurtboxes against all entities with hitboxes
    for (const [attackerId, attackerComponents] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
      const hurt = attackerComponents.HurtboxComponent
      if (!hurt?.enabled) continue
      const attackerPos = assertExists(attackerComponents.PositionComponent).offset
      const hurtWorldRect = rect.add(hurt.rect, attackerPos)

      for (const [targetId, targetComponents] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
        if (targetId === attackerId) continue
        const hit = targetComponents.HitboxComponent
        if (!hit?.enabled) continue
        // mask test
        if (!masksOverlap(hurt.mask, hit.mask)) continue

        const targetPos = assertExists(targetComponents.PositionComponent).offset
        const hitWorldRect = rect.add(hit.rect, targetPos)

        if (!rect.aabbOverlap(hurtWorldRect, hitWorldRect)) continue

        const hurtCentre = rect.centre(hurtWorldRect)
        const hitCentre = rect.centre(hitWorldRect)
        const attackVec2 = vec2.sub(hitCentre, hurtCentre)

        // Enqueue mailbox event on the target, if present
        const targetMailbox = targetComponents.MailboxComponent
        if (targetMailbox) {
          const mail: EntityMail = { type: 'combat-hit', attackerId, attackVec2 }
          targetMailbox.eventQueue.push(mail)
        }

      }
    }
  }

  dispose() {}
}
