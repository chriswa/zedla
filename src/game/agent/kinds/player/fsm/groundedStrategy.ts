import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { CanvasLog } from '@/dev/canvasLog'
import { AgentContext } from '@/game/agent/agentContext'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { ECS } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class GroundedStrategy implements FsmStrategy<AgentContext, PlayerStrategyFsmClassMapKeys> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
    private canvasLog: CanvasLog,
  ) {}

  onEnter(agentContext: AgentContext): void {
    // Restore air dash availability when landing
    this.playerMovementBehavior.setAirDashAvailable(agentContext, true)

    // Check for buffered jump input when entering grounded state
    if (this.playerMovementBehavior.hasBufferedJumpInput(agentContext)) {
      // Don't play stand animation, we'll immediately transition to airborne
      return
    }

    // Start with stand animation when entering grounded state
    this.playerAnimationBehavior.playAnimation(this.ecs, agentContext.entityId, 'stand')
  }

  onExit(_agentContext: AgentContext): void {}

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Check for buffered jump input at start of update (handles AttackStrategy landing)
    if (this.playerMovementBehavior.hasBufferedJumpInput(agentContext)) {
      const elapsed = this.playerMovementBehavior.getJumpInputBufferElapsed(agentContext)
      this.canvasLog.postEphemeral(`Buffered jump! (${elapsed} ticks after input)`)
      this.playerMovementBehavior.executeJump(agentContext)
      return 'AirborneStrategy'
    }

    // Facing and horizontal movement
    const inputDirection = this.input.getHorizontalInputDirection()
    const isCrouching = this.input.isDown(Button.DOWN)

    // Apply movement physics
    this.playerMovementBehavior.applyGroundMovement(entityId, inputDirection, isCrouching)

    // Handle animations
    if (isCrouching) {
      this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'crouch')
    }
    else {
      if (inputDirection !== 0) {
        this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'walk')
      }
      else {
        // Play stand animation if velocity is low (like legacy)
        if (Math.abs(body.velocity[0]!) < 0.5) {
          this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'stand')
        }
      }
    }

    // Jump (from grounded or buffered input)
    if (this.input.wasHitThisTick(Button.JUMP)) {
      this.playerMovementBehavior.executeJump(agentContext)
      return 'AirborneStrategy'
    }

    // Dash
    if (this.input.wasHitThisTick(Button.DASH)) {
      return 'DashStrategy'
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
