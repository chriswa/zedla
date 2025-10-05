import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { AgentContext } from '@/game/agent/agentContext'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { ECS } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class SprintingStrategy implements FsmStrategy<AgentContext, PlayerStrategyFsmClassMapKeys> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  onEnter(agentContext: AgentContext): void {
    // TODO: sprint animation when available
    this.playerAnimationBehavior.playAnimation(this.ecs, agentContext.entityId, 'walk')
  }

  onExit(_agentContext: AgentContext): void {}

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    const inputDirection = this.input.getHorizontalInputDirection()
    const dashHeld = this.input.isDown(Button.DASH)

    // Apply sprint movement
    this.playerMovementBehavior.applySprintMovement(entityId, inputDirection)

    // If dash button released, return to normal grounded state
    if (!dashHeld) {
      return 'GroundedStrategy'
    }

    // Check for buffered jump input at start of update
    if (this.playerMovementBehavior.hasBufferedJumpInput(agentContext)) {
      this.playerMovementBehavior.executeJump(agentContext)
      return 'AirborneStrategy'
    }

    // Jump
    if (this.input.wasHitThisTick(Button.JUMP)) {
      this.playerMovementBehavior.executeJump(agentContext)
      return 'AirborneStrategy'
    }

    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return 'AttackStrategy'
    }

    // If no longer contacting ground, start coyote time and go airborne
    if (!body.touchingDown) {
      this.playerMovementBehavior.startCoyoteTime(agentContext)
      return 'AirborneStrategy'
    }

    return undefined
  }
}
