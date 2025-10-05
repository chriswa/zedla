import { AgentContext } from '@/game/agent/agentContext'
import { AgentLifecycleConsumer } from '@/game/agent/agentLifecycleConsumer'
import { Tickstamp, TimerSystem } from '@/game/agent/systems/timerSystem'
import { PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { EntityDataMap } from '@/game/ecs/entityDataMap'
import { Vec2, vec2 } from '@/math/vec2'
import { directionToFacing, facingToDirection } from '@/types/facing'
import { singleton } from 'tsyringe'

interface PlayerMovementEntityData {
  coyoteTimeStart: Tickstamp | undefined
  jumpInputBufferStart: Tickstamp | undefined
  dashTimeStart: Tickstamp | undefined
  isAirDashAvailable: boolean
}

@singleton()
class PlayerMovementEntityDataMap extends EntityDataMap<PlayerMovementEntityData> {}

// Physics constants
export const GRAVITY = 0.00400
const WALK_ACCEL = 0.00250
const WALK_DECEL = 0.00100
const AIR_ACCEL = 0.00120
const MAX_X_SPEED = 0.20000
const JUMP_IMPULSE = 0.60000
const JUMP_HOLD_BOOST = 0.00150
const JUMP_X_BOOST = 0.00065 / (MAX_X_SPEED - AIR_ACCEL * 1000 / 60)
const ZERO_THRESHOLD_SPEED = 0.01 * 1000
const DASH_SPEED = 0.50000
const SPRINT_ACCEL = 0.00350
const SPRINT_DECEL = 0.00150
const SPRINT_MAX_SPEED = 0.28000

// Jump timing constants
export const COYOTE_TIME_TICKS = 3
export const JUMP_INPUT_BUFFER_TICKS = 6

// Dash timing constants
export const DASH_MIN_DURATION_TICKS = 8
export const DASH_SPRINT_TRANSITION_TICKS = 18

const GRAVITY_VEC2 = vec2.create(0, GRAVITY)

@singleton()
export class PlayerMovementBehavior implements AgentLifecycleConsumer {
  constructor(
    private ecs: ECS,
    private timerSystem: TimerSystem,
    private playerMovementEntityDataMap: PlayerMovementEntityDataMap,
  ) {}

  afterSpawn(entityId: EntityId): void {
    this.playerMovementEntityDataMap.set(entityId, {
      coyoteTimeStart: undefined,
      jumpInputBufferStart: undefined,
      dashTimeStart: undefined,
      isAirDashAvailable: false,
    })
  }

  beforeDestroy(entityId: EntityId): void {
    this.playerMovementEntityDataMap.delete(entityId)
  }

  private getData(agentContext: AgentContext): PlayerMovementEntityData {
    return this.playerMovementEntityDataMap.get(agentContext.entityId)
  }

  startCoyoteTime(agentContext: AgentContext): void {
    this.timerSystem.setTimer(agentContext, this.getData(agentContext), 'coyoteTimeStart')
  }

  canCoyoteJump(agentContext: AgentContext): boolean {
    const elapsed = this.timerSystem.maybeGetElapsedTicks(agentContext, this.getData(agentContext), 'coyoteTimeStart')
    return elapsed !== undefined && elapsed < COYOTE_TIME_TICKS
  }

  getCoyoteTimeElapsed(agentContext: AgentContext): number {
    return this.timerSystem.getElapsedTicks(agentContext, this.getData(agentContext), 'coyoteTimeStart')
  }

  bufferJumpInput(agentContext: AgentContext): void {
    this.timerSystem.setTimer(agentContext, this.getData(agentContext), 'jumpInputBufferStart')
  }

  hasBufferedJumpInput(agentContext: AgentContext): boolean {
    const elapsed = this.timerSystem.maybeGetElapsedTicks(agentContext, this.getData(agentContext), 'jumpInputBufferStart')
    return elapsed !== undefined && elapsed < JUMP_INPUT_BUFFER_TICKS
  }

  getJumpInputBufferElapsed(agentContext: AgentContext): number {
    return this.timerSystem.getElapsedTicks(agentContext, this.getData(agentContext), 'jumpInputBufferStart')
  }

  isAirDashAvailable(agentContext: AgentContext): boolean {
    return this.getData(agentContext).isAirDashAvailable
  }

  setAirDashAvailable(agentContext: AgentContext, available: boolean): void {
    this.getData(agentContext).isAirDashAvailable = available
  }

  startDashTimer(agentContext: AgentContext): void {
    this.timerSystem.setTimer(agentContext, this.getData(agentContext), 'dashTimeStart')
  }

  getDashElapsedTicks(agentContext: AgentContext): number {
    return this.timerSystem.getElapsedTicks(agentContext, this.getData(agentContext), 'dashTimeStart')
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

    // Cap walk speed
    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))
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

    // Cap air speed
    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))
  }

  executeJump(agentContext: AgentContext): void {
    const body = this.ecs.getComponent(agentContext.entityId, 'PhysicsBodyComponent')
    body.velocity[1] = -JUMP_IMPULSE

    // Clear coyote time and jump input buffer when successfully jumping
    this.timerSystem.clearTimer(this.getData(agentContext), 'coyoteTimeStart')
    this.timerSystem.clearTimer(this.getData(agentContext), 'jumpInputBufferStart')
  }

  applyDashMovement(entityId: EntityId): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')

    // Set horizontal velocity to dash speed in facing direction
    const dashDirection = facingToDirection(facing.value)
    body.velocity[0] = DASH_SPEED * dashDirection

    // Apply gravity
    const acceleration = vec2.clone(GRAVITY_VEC2)
    this.applyAccelerationToVelocity(body, acceleration)
  }

  applySprintMovement(entityId: EntityId, inputDirection: -1 | 0 | 1): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')

    // Update facing
    const inputFacing = directionToFacing(inputDirection)
    if (inputFacing) { facing.value = inputFacing }

    const acceleration = vec2.clone(GRAVITY_VEC2)

    if (inputDirection !== 0) {
      // Only accelerate if below sprint max speed (preserve higher speeds from dash)
      if (Math.abs(body.velocity[0]!) < SPRINT_MAX_SPEED) {
        acceleration[0] = inputDirection * SPRINT_ACCEL
      }
    }
    else {
      // Decelerate when no input
      if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
        body.velocity[0] = 0
        acceleration[0] = 0
      }
      else {
        acceleration[0] = -SPRINT_DECEL * Math.sign(body.velocity[0]!)
      }
    }

    this.applyAccelerationToVelocity(body, acceleration)
    // No velocity cap - allow dash speeds to persist and decay naturally
  }

  private applyAccelerationToVelocity(body: PhysicsBodyComponent, acceleration: Vec2): void {
    const dt = 1000 / 60
    body.velocity = vec2.add(body.velocity, vec2.mulScalar(acceleration, dt))
  }
}
