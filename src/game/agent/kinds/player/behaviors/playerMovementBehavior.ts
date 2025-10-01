import { AgentContext } from '@/game/agent/agentContext'
import { AgentLifecycleConsumer } from '@/game/agent/agentLifecycleConsumer'
import { PlayerTimerBehavior } from '@/game/agent/kinds/player/behaviors/playerTimerBehavior'
import { PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { Vec2, vec2 } from '@/math/vec2'
import { directionToFacing } from '@/types/facing'
import { singleton } from 'tsyringe'

// Physics constants
const GRAVITY = 0.00400
const WALK_ACCEL = 0.00250
const WALK_DECEL = 0.00100
const AIR_ACCEL = 0.00120
const MAX_X_SPEED = 0.20000
const JUMP_IMPULSE = 0.60000
const JUMP_HOLD_BOOST = 0.00150
const JUMP_X_BOOST = 0.00065 / (MAX_X_SPEED - AIR_ACCEL * 1000 / 60)
const ZERO_THRESHOLD_SPEED = 0.01 * 1000

// Jump timing constants
export const COYOTE_TIME_TICKS = 3
export const JUMP_INPUT_BUFFER_TICKS = 6

const GRAVITY_VEC2 = vec2.create(0, GRAVITY)

@singleton()
export class PlayerMovementBehavior implements AgentLifecycleConsumer {
  constructor(
    private ecs: ECS,
    private playerTimerBehavior: PlayerTimerBehavior,
  ) {}

  afterSpawn(_entityId: EntityId): void {}

  beforeDestroy(_entityId: EntityId): void {}

  startCoyoteTime(agentContext: AgentContext): void {
    this.playerTimerBehavior.setTimer(agentContext, 'coyoteTime')
  }

  canCoyoteJump(agentContext: AgentContext): boolean {
    const elapsed = this.playerTimerBehavior.maybeGetElapsedTicks(agentContext, 'coyoteTime')
    return elapsed !== undefined && elapsed < COYOTE_TIME_TICKS
  }

  bufferJumpInput(agentContext: AgentContext): void {
    this.playerTimerBehavior.setTimer(agentContext, 'jumpInputBuffer')
  }

  hasBufferedJumpInput(agentContext: AgentContext): boolean {
    const elapsed = this.playerTimerBehavior.maybeGetElapsedTicks(agentContext, 'jumpInputBuffer')
    return elapsed !== undefined && elapsed < JUMP_INPUT_BUFFER_TICKS
  }

  applyGroundMovement(entityId: EntityId, inputDirection: -1 | 0 | 1, isCrouching: boolean): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')

    // Update facing
    const inputFacing = directionToFacing(inputDirection)
    if (inputFacing) { facing.value = inputFacing }

    const acceleration = vec2.clone(GRAVITY_VEC2)

    if (isCrouching) {
      // Crouching: decelerate
      if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
        body.velocity[0] = 0
        acceleration[0] = 0
      }
      else {
        acceleration[0] = -WALK_DECEL * Math.sign(body.velocity[0]!)
      }
    }
    else {
      // Normal movement
      if (inputDirection !== 0) {
        acceleration[0] = inputDirection * WALK_ACCEL
      }
      else {
        if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
          body.velocity[0] = 0
          acceleration[0] = 0
        }
        else {
          acceleration[0] = -WALK_DECEL * Math.sign(body.velocity[0]!)
        }
      }
    }

    this.applyAccelerationToVelocity(body, acceleration)
  }

  applyAirMovement(entityId: EntityId, inputDirection: -1 | 0 | 1, jumpHeld: boolean): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')

    // Update facing
    const inputFacing = directionToFacing(inputDirection)
    if (inputFacing) { facing.value = inputFacing }

    // Create acceleration vector starting with gravity
    const acceleration = vec2.create(
      inputDirection * AIR_ACCEL,
      GRAVITY,
    )

    // Apply jump modifiers to vertical acceleration
    if (body.velocity[1]! < 0) {
      acceleration[1]! -= JUMP_X_BOOST * Math.abs(body.velocity[0]!)
      if (jumpHeld) { acceleration[1]! -= JUMP_HOLD_BOOST }
    }

    this.applyAccelerationToVelocity(body, acceleration)
  }

  executeJump(agentContext: AgentContext): void {
    const body = this.ecs.getComponent(agentContext.entityId, 'PhysicsBodyComponent')
    body.velocity[1] = -JUMP_IMPULSE

    // Clear coyote time and jump input buffer when successfully jumping
    this.playerTimerBehavior.clearTimer(agentContext, 'coyoteTime')
    this.playerTimerBehavior.clearTimer(agentContext, 'jumpInputBuffer')
  }

  private applyAccelerationToVelocity(body: PhysicsBodyComponent, acceleration: Vec2): void {
    const dt = 1000 / 60

    body.velocity = vec2.add(body.velocity, vec2.mulScalar(acceleration, dt))

    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))
  }
}
