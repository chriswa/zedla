import { AirborneStrategy } from './airborneStrategy'
import { AttackStrategy } from './attackStrategy'
import { GroundedStrategy } from './groundedStrategy'
import { HurtStrategy } from './hurtStrategy'

// Simple class map - no eager resolution
export const playerStrategyFsmClassMap = {
  GroundedStrategy,
  AirborneStrategy,
  AttackStrategy,
  HurtStrategy,
} as const
