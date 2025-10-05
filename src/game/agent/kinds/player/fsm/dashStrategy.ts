import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { AgentContext } from '@/game/agent/agentContext'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { DASH_MIN_DURATION_TICKS, DASH_SPRINT_TRANSITION_TICKS, PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { ECS } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class DashStrategy implements FsmStrategy<AgentContext, PlayerStrategyFsmClassMapKeys> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  onEnter(agentContext: AgentContext): void {
    this.playerMovementBehavior.startDashTimer(agentContext)
    // TODO: dash animation when available
    this.playerAnimationBehavior.playAnimation(this.ecs, agentContext.entityId, 'walk')
  }

  onExit(_agentContext: AgentContext): void {}

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    const dashElapsed = this.playerMovementBehavior.getDashElapsedTicks(agentContext)
    const dashHeld = this.input.isDown(Button.DASH)

    // Apply dash movement
    this.playerMovementBehavior.applyDashMovement(entityId)

    // Check for early release (after minimum duration)
    if (!dashHeld && dashElapsed >= DASH_MIN_DURATION_TICKS) {
      return body.touchingDown ? 'GroundedStrategy' : 'AirborneStrategy'
    }

    // Transition to sprinting if dash held long enough (and grounded)
    if (dashHeld && dashElapsed >= DASH_SPRINT_TRANSITION_TICKS && body.touchingDown) {
      return 'SprintingStrategy'
    }

    // If we leave the ground during dash, go airborne
    if (!body.touchingDown) {
      return 'AirborneStrategy'
    }

    return undefined
  }
}
