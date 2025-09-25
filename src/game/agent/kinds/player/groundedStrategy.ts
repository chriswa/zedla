import { PlayerAnimationBehavior } from './playerAnimationBehavior'
import { PlayerStrategyKey } from './playerStrategyKey'
import { Button, Input } from '@/app/input'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/behaviors/playerMovementBehavior'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class GroundedStrategy implements FsmStrategy<EntityId, PlayerStrategyKey> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  onEnter(entityId: EntityId): void {
    // reset coyote timer on solid ground
    this.playerMovementBehavior.resetFallTicks(entityId)

    // Start with stand animation when entering grounded state
    this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'stand')
  }

  onExit(_entityId: EntityId): void {}

  update(entityId: EntityId): PlayerStrategyKey | undefined {
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

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

    // Jump
    if (this.input.wasHitThisTick(Button.JUMP) && this.playerMovementBehavior.canJump(entityId)) {
      if (this.playerMovementBehavior.attemptJump(entityId)) {
        return 'AirborneStrategy'
      }
    }
    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return 'AttackStrategy'
    }
    // If no longer contacting ground, start counting fall ticks and go airborne
    if (!body.touchingDown) {
      return 'AirborneStrategy'
    }
    return undefined
  }
}
