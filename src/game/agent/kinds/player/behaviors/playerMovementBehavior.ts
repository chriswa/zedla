import { AgentLifecycleConsumer } from '@/game/agent/agentLifecycleConsumer'
import { PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
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
const JUMP_GRACE_TICKS = 3

const GRAVITY_VEC2 = vec2.create(0, GRAVITY)

interface MovementData {
  fallTicks: number
}

@singleton()
export class PlayerMovementBehavior implements AgentLifecycleConsumer {
  private movementData = new EntityDataManager<MovementData>()

  constructor(private ecs: ECS) {}

  afterSpawn(entityId: EntityId): void {
    this.movementData.onCreate(entityId, { fallTicks: 9999 })
  }

  beforeDestroy(entityId: EntityId): void {
    this.movementData.onDestroy(entityId)
  }

  resetFallTicks(entityId: EntityId): void {
    const data = this.movementData.get(entityId)
    data.fallTicks = 0
  }

  incrementFallTicks(entityId: EntityId): void {
    const data = this.movementData.get(entityId)
    data.fallTicks += 1
  }

  canJump(entityId: EntityId): boolean {
    const data = this.movementData.get(entityId)
    return data.fallTicks < JUMP_GRACE_TICKS
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

  attemptJump(entityId: EntityId): boolean {
    if (!this.canJump(entityId)) { return false }

    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const data = this.movementData.get(entityId)

    body.velocity[1] = -JUMP_IMPULSE
    data.fallTicks = 9999
    return true
  }

  private applyAccelerationToVelocity(body: PhysicsBodyComponent, acceleration: Vec2): void {
    const dt = 1000 / 60

    body.velocity = vec2.add(body.velocity, vec2.mulScalar(acceleration, dt))

    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))
  }
}
