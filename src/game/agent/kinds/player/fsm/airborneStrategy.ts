import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys'
import { Button, Input } from '@/app/input'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

@singleton()
export class AirborneStrategy implements FsmStrategy<EntityId, PlayerStrategyFsmClassMapKeys> {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  onEnter(entityId: EntityId): void {
    // Start with jump animation when entering airborne state
    this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'jump')
  }

  onExit(_entityId: EntityId): void {}

  update(entityId: EntityId): PlayerStrategyFsmClassMapKeys | undefined {
    if (this.combatBehavior.checkForHurt(entityId)) { return 'HurtStrategy' }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Facing and horizontal air control
    const inputDirection = this.input.getHorizontalInputDirection()
    const jumpHeld = this.input.isDown(Button.JUMP)

    // Count fall and apply air movement
    this.playerMovementBehavior.incrementFallTicks(entityId)
    this.playerMovementBehavior.applyAirMovement(entityId, inputDirection, jumpHeld)

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
