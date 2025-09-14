import type { EntityId } from '@/game/ecs/ecs'
import type { Vec2 } from '@/math/vec2'

export interface CombatHitMail {
  type: 'combat-hit'
  attackerId: EntityId
  attackVec2: Vec2
}

export type EntityMail = CombatHitMail

