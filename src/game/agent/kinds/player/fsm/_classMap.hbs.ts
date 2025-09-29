// {{include "@/templates/classMap.ts.hbs" identifier="playerStrategyFsmClassMap" files=(readdir "." "*.ts")}}

// ============= GENERATED CODE =============
import { AirborneStrategy } from './airborneStrategy'
import { AttackStrategy } from './attackStrategy'
import { GroundedStrategy } from './groundedStrategy'
import { HurtStrategy } from './hurtStrategy'

export const playerStrategyFsmClassMap = {
  AirborneStrategy,
  AttackStrategy,
  GroundedStrategy,
  HurtStrategy,
} as const
