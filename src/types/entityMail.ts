import { EntityId } from '@/game/ecs/ecs'
import { Vec2 } from '@/math/vec2'

export interface CombatHitMail {
  type: 'combat-hit'
  attackerId: EntityId
  attackVec2: Vec2
}

export interface TodoMail {
  type: 'todo'
  message: string
}

export type EntityMail = CombatHitMail | TodoMail
