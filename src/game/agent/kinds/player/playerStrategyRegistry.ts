import { AirborneStrategy } from './airborneStrategy'
import { AttackStrategy } from './attackStrategy'
import { GroundedStrategy } from './groundedStrategy'
import { HurtStrategy } from './hurtStrategy'
import { PlayerStrategyKey } from './playerStrategyKey'
import { EntityId } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { container } from 'tsyringe'

export type PlayerFsmStrategy = FsmStrategy<EntityId, PlayerStrategyKey>

export const playerStrategyRegistry = {
  GroundedStrategy: container.resolve(GroundedStrategy),
  AirborneStrategy: container.resolve(AirborneStrategy),
  AttackStrategy: container.resolve(AttackStrategy),
  HurtStrategy: container.resolve(HurtStrategy),
} as const satisfies Record<PlayerStrategyKey, PlayerFsmStrategy>

export function resolvePlayerStrategy(key: PlayerStrategyKey): PlayerFsmStrategy {
  return playerStrategyRegistry[key]
}
