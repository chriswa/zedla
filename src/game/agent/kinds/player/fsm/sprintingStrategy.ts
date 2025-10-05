import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { AgentContext } from '@/game/agent/agentContext'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { ECS } from '@/game/ecs/ecs'
import { facingToDirection } from '@/types/facing'
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
    // Store the current facing direction as sprint direction
    const facing = this.ecs.getComponent(agentContext.entityId, 'FacingComponent')
    const sprintDirection = facingToDirection(facing.value) as -1 | 1
    this.playerMovementBehavior.setSprintDirection(agentContext, sprintDirection)

    // TODO: sprint animation when available
    this.playerAnimationBehavior.playAnimation(this.ecs, agentContext.entityId, 'walk')
  }

  onExit(agentContext: AgentContext): void {
    // Clear sprint direction when exiting sprint
    this.playerMovementBehavior.clearSprintDirection(agentContext)
  }

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    const dashHeld = this.input.isDown(Button.DASH)

    // Apply sprint movement using locked sprint direction (ignore input)
    const sprintDirection = this.playerMovementBehavior.getSprintDirection(agentContext)!
    this.playerMovementBehavior.applySprintMovement(entityId, sprintDirection)

    // If dash button released, transition based on whether grounded or airborne
    if (!dashHeld) {
      return body.touchingDown ? 'GroundedStrategy' : 'AirborneStrategy'
    }

    // Check for buffered jump input at start of update
    if (this.playerMovementBehavior.hasBufferedJumpInput(agentContext)) {
      this.playerMovementBehavior.executeJump(agentContext)
      // Stay in SprintingStrategy - jump while sprinting maintains sprint
      return undefined
    }

    // Jump while sprinting - maintain sprint state
    if (this.input.wasHitThisTick(Button.JUMP)) {
      this.playerMovementBehavior.executeJump(agentContext)
      // Stay in SprintingStrategy - jump while sprinting maintains sprint
      return undefined
    }

    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return 'AttackStrategy'
    }

    // If no longer contacting ground (fell off ledge), stay in SprintingStrategy
    // The strategy handles both grounded and airborne sprint movement
    if (!body.touchingDown) {
      this.playerMovementBehavior.startCoyoteTime(agentContext)
      // Stay in SprintingStrategy to maintain sprint momentum
    }

    return undefined
  }
}
