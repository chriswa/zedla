import { AgentContext } from '@/game/agent/agentContext'
import { StatefulAgentBehavior } from '@/game/agent/behaviors/statefulAgentBehavior'
import { Tickstamp, TimerSystem } from '@/game/agent/systems/timerSystem'
import { EntityDataMap } from '@/game/ecs/entityDataMap'
import { singleton } from 'tsyringe'

// Attack timing constants (extracted from animation definitions)
// Standing attack: 5 ticks windup, 7 ticks sword active, 30 ticks recovery
export const ATTACK_STANDING_SWORD_START_TICK = 5
export const ATTACK_STANDING_SWORD_END_TICK = 12 // 5 + 7
export const ATTACK_STANDING_CAN_INTERRUPT_TICK = 12 // Can interrupt when sword becomes inactive
export const ATTACK_STANDING_TOTAL_TICKS = 42 // 5 + 7 + 30

// Crouch attack: 7 ticks sword active, 5 ticks recovery
export const ATTACK_CROUCH_SWORD_START_TICK = 0
export const ATTACK_CROUCH_SWORD_END_TICK = 7
export const ATTACK_CROUCH_CAN_INTERRUPT_TICK = 7 // Can interrupt when sword becomes inactive
export const ATTACK_CROUCH_TOTAL_TICKS = 12 // 7 + 5

interface PlayerCombatEntityData {
  attackTimeStart: Tickstamp | undefined
}

@singleton()
class PlayerCombatEntityDataMap extends EntityDataMap<PlayerCombatEntityData> {}

@singleton()
export class PlayerCombatBehavior extends StatefulAgentBehavior<PlayerCombatEntityData> {
  constructor(
    private timerSystem: TimerSystem,
    playerCombatEntityDataMap: PlayerCombatEntityDataMap,
  ) {
    super(playerCombatEntityDataMap)
  }

  protected createInitialEntityData(): PlayerCombatEntityData {
    return {
      attackTimeStart: undefined,
    }
  }

  startAttackTimer(agentContext: AgentContext): void {
    this.timerSystem.setTimer(agentContext, this.getData(agentContext), 'attackTimeStart')
  }

  getAttackElapsedTicks(agentContext: AgentContext): number {
    return this.timerSystem.getElapsedTicks(agentContext, this.getData(agentContext), 'attackTimeStart')
  }
}
