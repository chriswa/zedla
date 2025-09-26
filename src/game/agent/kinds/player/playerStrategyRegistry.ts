import { AirborneStrategy } from './airborneStrategy'
import { AttackStrategy } from './attackStrategy'
import { GroundedStrategy } from './groundedStrategy'
import { HurtStrategy } from './hurtStrategy'
import { PlayerStrategyKey } from './playerStrategyKey'
import { EntityId } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { resolveFromClassMap } from '@/util/resolveFromClassMap'

export type PlayerFsmStrategy = FsmStrategy<EntityId, PlayerStrategyKey>

// Simple class map - no eager resolution
const playerStrategyClassMap = {
  GroundedStrategy,
  AirborneStrategy,
  AttackStrategy,
  HurtStrategy,
} as const

export function resolvePlayerStrategy(key: PlayerStrategyKey): PlayerFsmStrategy {
  return resolveFromClassMap(playerStrategyClassMap, key)
}
