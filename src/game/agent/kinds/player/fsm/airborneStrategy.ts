import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { CanvasLog } from '@/dev/canvasLog'
import { AgentContext } from '@/game/agent/agentContext'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { PlayerTimerBehavior } from '@/game/agent/kinds/player/behaviors/playerTimerBehavior'
import { ECS } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class AirborneStrategy implements FsmStrategy<AgentContext, PlayerStrategyFsmClassMapKeys> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private playerTimerBehavior: PlayerTimerBehavior,
    private combatBehavior: CombatBehavior,
    private canvasLog: CanvasLog,
  ) {}

  onEnter(agentContext: AgentContext): void {
    // Start with jump animation when entering airborne state
    this.playerAnimationBehavior.playAnimation(this.ecs, agentContext.entityId, 'jump')
  }

  onExit(_agentContext: AgentContext): void {}

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Facing and horizontal air control
    const inputDirection = this.input.getHorizontalInputDirection()
    const jumpHeld = this.input.isDown(Button.JUMP)

    // Apply air movement
    this.playerMovementBehavior.applyAirMovement(entityId, inputDirection, jumpHeld)

    // Check for jump input - either coyote jump or buffer for landing
    if (this.input.wasHitThisTick(Button.JUMP)) {
      if (this.playerMovementBehavior.canCoyoteJump(agentContext)) {
        // Coyote jump: player just left ground, allow jump
        const elapsed = this.playerTimerBehavior.getElapsedTicks(agentContext, 'coyoteTime')
        this.canvasLog.postEphemeral(`Coyote jump! (${elapsed} ticks after leaving ground)`)
        this.playerMovementBehavior.executeJump(agentContext)
        return 'AirborneStrategy'
      }

      // Buffer jump input for when we land
      this.playerMovementBehavior.bufferJumpInput(agentContext)
    }

    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return 'AttackStrategy'
    }

    // Landed? Only transition to grounded if we're moving downward (or stopped vertically)
    if (body.touchingDown && body.velocity[1]! >= 0) {
      return 'GroundedStrategy'
    }
    return undefined
  }
}
