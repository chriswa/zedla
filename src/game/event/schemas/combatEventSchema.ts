import type { EntityId } from '@/game/ecs/ecs'
import type { Vec2 } from '@/math/vec2'

export const combatEventSchema = {
  'combat:hit': (_attackerEntityId: EntityId, _targetEntityId: EntityId, _attackVec2: Vec2): void => {},
} as const

