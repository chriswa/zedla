import { singleton, container } from 'tsyringe'

import type { IAgentKind } from '../agentKind'
import { ECS } from '../../ecs/ecs'
import type { EntityId, EntityComponentMap } from '../../ecs/ecs'
import type { RoomContext } from '../../roomContext'
import { Input, Button } from '@/app/input'
import { Facing, directionToFacing } from '@/types/facing'
import { PhysicsBodyComponent, HitboxComponent, FacingComponent, HurtboxComponent } from '@/game/ecs/components'
import { rect } from '@/math/rect'
import { vec2, type Vec2 } from '@/math/vec2'
import { createCombatMask, CombatBit } from '@/types/combat'
import { AnimationFrameFlag } from '@/types/animationFlags'
import { AnimationController } from '../animationController'
import { assertExists } from '@/util/assertExists'
import { DirectFSM, type DirectFSMStrategy } from '@/util/fsm'
import { CanvasLog } from '@/dev/canvasLog'

// Physics constants
const GRAVITY = 0.00400
const WALK_ACCEL = 0.00250
const WALK_DECEL = 0.00100
const AIR_ACCEL = 0.00120
const MAX_X_SPEED = 0.20000
const JUMP_IMPULSE = 0.60000
const JUMP_HOLD_BOOST = 0.00150
const JUMP_X_BOOST = 0.00065 / (MAX_X_SPEED - AIR_ACCEL * 1000/60)
const HURT_IMPULSE_X = 0.15000
const HURT_IMPULSE_Y = 0.40000

function applyAccelerationToVelocity(body: PhysicsBodyComponent, acceleration: Vec2): void {
  const dt = 1000 / 60
  
  // Update velocity from acceleration
  body.velocity[0]! += acceleration[0]! * dt
  body.velocity[1]! += acceleration[1]! * dt
  
  // Clamp horizontal velocity to max speed
  body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))
}

const GRAVITY_VEC2 = vec2.create(0, GRAVITY)

const HURT_TICKS = Math.round(0.4 * 60) // ~400ms

const ZERO_THRESHOLD_SPEED = 0.01 * 1000
const JUMP_GRACE_TICKS = 3

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_STANDING_BASE = rect.createCentred(0, -21, 18, 4)
const SWORD_HURTBOX_STANDING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, 0))
const SWORD_HURTBOX_STANDING_LEFT  = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, 0))

const SWORD_CROUCH_OFFSET_Y = 13
const SWORD_HURTBOX_CROUCHING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, SWORD_CROUCH_OFFSET_Y))
const SWORD_HURTBOX_CROUCHING_LEFT  = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, SWORD_CROUCH_OFFSET_Y))

interface PlayerSpawnData {
}

interface PlayerEntityData {
  fallTicks: number
}

@singleton()
class PlayerEntityDataStore {
  public map = new Map<EntityId, PlayerEntityData>()
}


type PlayerFsmStrategy = DirectFSMStrategy<EntityId>

@singleton()
class PlayerUtilities {
  public readonly animationController = new AnimationController('link')
  
  constructor(private ecs: ECS) {}
  checkForHurt(entityId: EntityId): boolean {
    const mailbox = assertExists(this.ecs.getComponent(entityId, 'MailboxComponent'))
    
    // Peek at mailbox to determine if we should transition to hurt state
    for (const mail of mailbox.eventQueue) {
      if (mail.type === 'combat-hit') {
        return true
      }
    }
    
    return false
  }
}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    private playerDataStore: PlayerEntityDataStore,
    private playerUtilities: PlayerUtilities,
    private canvasLog: CanvasLog,
  ) {}
  private fsmByEntityId = new Map<EntityId, DirectFSM<PlayerFsmStrategy, EntityId>>()

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.playerUtilities.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(SWORD_HURTBOX_STANDING_BASE, createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))

    // Initialize player data
    this.playerDataStore.map.set(entityId, { fallTicks: 9999 })
    
    const fsm = new DirectFSM<PlayerFsmStrategy, EntityId>(playerStrategyRegistry.GroundedStrategy)
    // immediate enter for initial FSM strategy
    fsm.active.onEnter(entityId)
    this.fsmByEntityId.set(entityId, fsm)
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    const fsm = assertExists(this.fsmByEntityId.get(entityId))
    fsm.processTransitions(entityId)

    const physics = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    this.canvasLog.upsertPermanent('playerPhysics', `p.v = ${vec2.toString(physics.velocity)}`, 3)
  }

  onDestroy(entityId: EntityId): void {
    this.fsmByEntityId.delete(entityId)
    this.playerDataStore.map.delete(entityId)
  }
}

// ------------------ Strategies ------------------

@singleton()
class GroundedStrategy implements PlayerFsmStrategy {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerUtilities: PlayerUtilities,
    private playerDataStore: PlayerEntityDataStore,
  ) {}
  onEnter(entityId: EntityId): void {
    // reset coyote timer on solid ground
    const data = assertExists(this.playerDataStore.map.get(entityId))
    data.fallTicks = 0
    
    // Start with stand animation when entering grounded state
    this.playerUtilities.animationController.playAnimation(this.ecs, entityId, 'stand')
  }
  onExit(_entityId: EntityId): void {}
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.playerUtilities.checkForHurt(entityId)) return playerStrategyRegistry.HurtStrategy
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    // Facing and horizontal movement
    const inputDirection = this.input.getHorizontalInputDirection()
    const inputFacing = directionToFacing(inputDirection)
    if (inputFacing) facing.value = inputFacing

    // No animation preservation - just use simple logic like legacy code
    
    // Check for crouching first
    const isCrouching = this.input.isDown(Button.DOWN)
    if (isCrouching) {
      // Crouching: decelerate and play crouch animation
      const acceleration = vec2.clone(GRAVITY_VEC2)
      if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
        body.velocity[0] = 0
        acceleration[0] = 0
      } else {
        acceleration[0] = -WALK_DECEL * Math.sign(body.velocity[0]!)
      }
      applyAccelerationToVelocity(body, acceleration)
      this.playerUtilities.animationController.playAnimation(this.ecs, entityId, 'crouch')
    } else {
      // Not crouching: normal movement and animations
      const acceleration = vec2.clone(GRAVITY_VEC2)
      if (inputDirection !== 0) {
        acceleration[0] = inputDirection * WALK_ACCEL
        applyAccelerationToVelocity(body, acceleration)
        this.playerUtilities.animationController.playAnimation(this.ecs, entityId, 'walk')
      } else {
        if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
          body.velocity[0] = 0
          acceleration[0] = 0
        } else {
          acceleration[0] = -WALK_DECEL * Math.sign(body.velocity[0]!)
        }
        applyAccelerationToVelocity(body, acceleration)
        
        // Play stand animation if velocity is low (like legacy)
        if (Math.abs(body.velocity[0]!) < 0.5) {
          this.playerUtilities.animationController.playAnimation(this.ecs, entityId, 'stand')
        }
      }
    }

    // Jump
    const data = assertExists(this.playerDataStore.map.get(entityId))
    if (this.input.wasHitThisTick(Button.JUMP) && data.fallTicks < JUMP_GRACE_TICKS) {
      body.velocity[1] = -JUMP_IMPULSE
      data.fallTicks = 9999
      return playerStrategyRegistry.AirborneStrategy
    }
    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return playerStrategyRegistry.AttackStrategy
    }
    // If no longer contacting ground, start counting fall ticks and go airborne
    const onGround = body.touchingDown === true
    if (!onGround) {
      return playerStrategyRegistry.AirborneStrategy
    }
    return undefined
  }
}

@singleton()
class AirborneStrategy implements PlayerFsmStrategy {
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerUtilities: PlayerUtilities,
    private playerDataStore: PlayerEntityDataStore,
  ) {}
  onEnter(entityId: EntityId): void {
    // Start with jump animation when entering airborne state
    this.playerUtilities.animationController.playAnimation(this.ecs, entityId, 'jump')
  }
  onExit(_entityId: EntityId): void {}
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.playerUtilities.checkForHurt(entityId)) return playerStrategyRegistry.HurtStrategy
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    // Facing and horizontal air control
    const inputDirection = this.input.getHorizontalInputDirection()
    const inputFacing = directionToFacing(inputDirection)
    if (inputFacing) facing.value = inputFacing

    // Count fall
    const data = assertExists(this.playerDataStore.map.get(entityId))
    data.fallTicks += 1

    // Create acceleration vector starting with gravity
    const acceleration = vec2.create(
      inputDirection * AIR_ACCEL,
      GRAVITY
    )

    // Apply jump modifiers to vertical acceleration
    if (body.velocity[1]! < 0) {
      acceleration[1]! -= JUMP_X_BOOST * Math.abs(body.velocity[0]!)
      if (this.input.isDown(Button.JUMP)) acceleration[1]! -= JUMP_HOLD_BOOST
    }

    applyAccelerationToVelocity(body, acceleration)

    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return playerStrategyRegistry.AttackStrategy
    }
    // Landed? Only transition to grounded if we're moving downward (or stopped vertically)
    if (body.touchingDown === true && body.velocity[1]! >= 0) {
      return playerStrategyRegistry.GroundedStrategy
    }
    return undefined
  }
}

@singleton()
class AttackStrategy implements PlayerFsmStrategy {
  private attackData = new Map<EntityId, { isCrouching: boolean, startedAirborne: boolean }>()
  
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerUtilities: PlayerUtilities,
  ) {}
  // Snapshot crouch decision on enter by DOWN held and current groundedness
  onEnter(entityId: EntityId): void {
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const isCrouching = this.input.isDown(Button.DOWN) && body.touchingDown === true
    const startedAirborne = !body.touchingDown
    
    // Store attack data for this entity
    this.attackData.set(entityId, { isCrouching, startedAirborne })
    
    this.playerUtilities.animationController.startAnimation(this.ecs, entityId, isCrouching ? 'crouch-attack' : 'attack')
  }
  onExit(entityId: EntityId): void {
    // Disable hurtbox when leaving attack state
    const hurtBox = assertExists(this.ecs.getComponent(entityId, 'HurtboxComponent'))
    hurtBox.enabled = false
    
    // Clean up attack data
    this.attackData.delete(entityId)
  }
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.playerUtilities.checkForHurt(entityId)) return playerStrategyRegistry.HurtStrategy
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    const hurtBox = assertExists(this.ecs.getComponent(entityId, 'HurtboxComponent'))
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    
    // Stop horizontal movement during attack only when grounded
    if (body.touchingDown) {
      body.velocity[0] = 0
    }
    
    // Apply gravity (attacks can happen in air)
    applyAccelerationToVelocity(body, GRAVITY_VEC2)
    
    // Enable sword per frame bits and set rect per facing
    const active = this.playerUtilities.animationController.hasCurrentFrameFlag(this.ecs, entityId, AnimationFrameFlag.SwordSwing)
    const attackData = assertExists(this.attackData.get(entityId))
    
    hurtBox.enabled = active
    if (active) {
      if (attackData.isCrouching) {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_CROUCHING_LEFT : SWORD_HURTBOX_CROUCHING_RIGHT
      } else {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_STANDING_LEFT : SWORD_HURTBOX_STANDING_RIGHT
      }
    }
    // Check if we just landed (was airborne attack, now touching ground)
    const justLanded = attackData.startedAirborne && body.touchingDown && body.velocity[1]! >= 0
    
    // Transition out when animation can be interrupted, is complete, or just landed
    if (this.playerUtilities.animationController.isCompleted(this.ecs, entityId) || 
        this.playerUtilities.animationController.hasCurrentFrameFlag(this.ecs, entityId, AnimationFrameFlag.CanInterrupt) ||
        justLanded) {
      return body.touchingDown ? playerStrategyRegistry.GroundedStrategy : playerStrategyRegistry.AirborneStrategy
    }
    return undefined
  }
}

@singleton()
class HurtStrategy implements PlayerFsmStrategy {
  private info = new Map<EntityId, { ticks: number }>()
  constructor(
    private ecs: ECS,
    private playerUtilities: PlayerUtilities,
  ) {}
  onEnter(entityId: EntityId): void {
    // Process combat-hit mail from mailbox
    const mailbox = assertExists(this.ecs.getComponent(entityId, 'MailboxComponent'))
    for (const mail of mailbox.eventQueue) {
      if (mail.type === 'combat-hit') {
        const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
        const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
        // Knockback opposite to player's facing direction
        body.velocity[0] = facing.value === Facing.RIGHT ? -HURT_IMPULSE_X : HURT_IMPULSE_X
        body.velocity[1] = -HURT_IMPULSE_Y
        this.info.set(entityId, { ticks: HURT_TICKS })
        break // Only process the first combat hit
      }
    }
    mailbox.eventQueue.length = 0
    
    // Disable hitbox during hurt state
    const hitbox = assertExists(this.ecs.getComponent(entityId, 'HitboxComponent'))
    hitbox.enabled = false
    
    // Set hurt animation
    const anim = this.ecs.getComponent(entityId, 'AnimationComponent')
    if (anim) this.playerUtilities.animationController.startAnimation(this.ecs, entityId, 'hurt')
  }
  onExit(entityId: EntityId): void {
    // Re-enable hitbox when leaving hurt state
    const hitbox = assertExists(this.ecs.getComponent(entityId, 'HitboxComponent'))
    hitbox.enabled = true
    
    // Clean up map entry
    this.info.delete(entityId)
  }
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    const rec = assertExists(this.info.get(entityId))
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    
    // Apply gravity during hurt state
    applyAccelerationToVelocity(body, GRAVITY_VEC2)
    
    rec.ticks -= 1
    if (rec.ticks <= 0) {
      // Check ground contact to determine next state
      return body.touchingDown ? playerStrategyRegistry.GroundedStrategy : playerStrategyRegistry.AirborneStrategy
    }
    
    return undefined
  }
}

const playerStrategyRegistry = {
  GroundedStrategy: container.resolve(GroundedStrategy),
  AirborneStrategy: container.resolve(AirborneStrategy),
  AttackStrategy: container.resolve(AttackStrategy),
  HurtStrategy: container.resolve(HurtStrategy),
} as const
