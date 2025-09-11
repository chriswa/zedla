import { singleton, container } from 'tsyringe'

import type { IAgentKind } from '../agentKind'
import { ECS } from '../../ecs/ecs'
import type { EntityId, EntityComponentMap } from '../../ecs/ecs'
import type { RoomContext } from '../../roomContext'
import { Input, Button } from '@/app/input'
import { Facing, directionToFacing } from '@/types/facing'
import { PhysicsBodyComponent, HitboxComponent, FacingComponent, HurtboxComponent } from '@/game/ecs/components'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { clamp } from '@/util/math'
import { createCombatMask, CombatBit } from '@/types/combat'
import { hasFrameFlag, AnimationFrameFlag } from '@/types/animationFlags'
import { AnimationController } from '../animationController'
import { assertExists } from '@/util/assertExists'
import { DirectFSM, type DirectFSMStrategy } from '@/util/fsm'

const MAX_X_SPEED = 0.1 * 1000
const WALK_ACCEL = (0.00125 * 1_000_000) / 60
const WALK_DECEL = (0.0005 * 1_000_000) / 60
const AIR_ACCEL  = (0.0006 * 1_000_000) / 60
const GRAVITY_Y  = (0.0020 * 1_000_000) / 60
const JUMP_VY    = -0.300 * 1000
const JUMP_HOLD_BOOST = (0.00075 * 1_000_000) / 60
const RUN_JUMP_BOOST_PER_SPEED = 3.25

const ZERO_THRESHOLD_SPEED = 0.01 * 1000
const JUMP_GRACE_TICKS = 3

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_BASE = rect.createCentred(0, -21, 18, 4)
const SWORD_HURTBOX_RIGHT = rect.add(SWORD_HURTBOX_BASE, vec2.create(15, 0))
const SWORD_HURTBOX_LEFT  = rect.add(SWORD_HURTBOX_BASE, vec2.create(-15, 0))

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

// Strategy registry will be populated after class definitions

// Constants for hurt
const HURT_VX = 0.075 * 1000 // 75 px/s
const HURT_VY = -0.200 * 1000 // -200 px/s upward
const HURT_TICKS = Math.round(0.4 * 60) // ~400ms

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
  ) {}
  private fsmByEntityId = new Map<EntityId, DirectFSM<PlayerFsmStrategy, EntityId>>()

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.playerUtilities.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(SWORD_HURTBOX_BASE, createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))

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
    
    // Preserve the end of attack animation if we're transitioning from AttackStrategy
    const anim = this.ecs.getComponent(entityId, 'AnimationComponent')
    if (anim) {
      const curFrame = anim.animation.frames[anim.frameIndex]!
      if (!hasFrameFlag(curFrame.flags, AnimationFrameFlag.CanInterrupt)) {
        this.playerUtilities.animationController.startAnimation(this.ecs, entityId, 'stand')
      }
    }
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

    // Create acceleration vector starting with gravity
    const acceleration = vec2.create(0, GRAVITY_Y)
    
    // Apply horizontal acceleration based on input
    if (inputDirection !== 0) {
      acceleration[0] = inputDirection * WALK_ACCEL
    } else {
      if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) {
        body.velocity[0] = 0
        acceleration[0] = 0
      } else {
        acceleration[0] = -WALK_DECEL * Math.sign(body.velocity[0]!)
      }
    }
    
    // Apply acceleration and clamp velocity
    body.velocity = vec2.add(body.velocity, acceleration)
    body.velocity[0] = clamp(body.velocity[0]!, -MAX_X_SPEED, MAX_X_SPEED)

    // Jump
    const data = assertExists(this.playerDataStore.map.get(entityId))
    if (this.input.wasHitThisTick(Button.JUMP) && data.fallTicks < JUMP_GRACE_TICKS) {
      body.velocity[1] = JUMP_VY
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
    // Preserve the end of attack animation if we're transitioning from AttackStrategy
    const anim = this.ecs.getComponent(entityId, 'AnimationComponent')
    if (anim) {
      const curFrame = anim.animation.frames[anim.frameIndex]!
      if (!hasFrameFlag(curFrame.flags, AnimationFrameFlag.CanInterrupt)) {
        this.playerUtilities.animationController.startAnimation(this.ecs, entityId, 'jump')
      }
    }
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
      GRAVITY_Y
    )

    // Apply jump modifiers to vertical acceleration
    if (body.velocity[1]! < 0) {
      acceleration[1]! -= RUN_JUMP_BOOST_PER_SPEED * Math.abs(body.velocity[0]!)
      if (this.input.isDown(Button.JUMP)) acceleration[1]! -= JUMP_HOLD_BOOST
    }

    // Apply acceleration and clamp velocity
    body.velocity = vec2.add(body.velocity, acceleration)
    body.velocity[0] = clamp(body.velocity[0]!, -MAX_X_SPEED, MAX_X_SPEED)

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
  constructor(
    private ecs: ECS,
    private input: Input,
    private playerUtilities: PlayerUtilities,
  ) {}
  // Snapshot crouch decision on enter by DOWN held and current groundedness
  onEnter(entityId: EntityId): void {
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const isCrouching = this.input.isDown(Button.DOWN) && body.touchingDown === true
    this.playerUtilities.animationController.startAnimation(this.ecs, entityId, isCrouching ? 'crouch-attack' : 'attack')
  }
  onExit(_entityId: EntityId): void {
    // ensure return to stand when exiting early
    // handled by next FSM strategy's onEnter
  }
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.playerUtilities.checkForHurt(entityId)) return playerStrategyRegistry.HurtStrategy
    const anim = assertExists(this.ecs.getComponent(entityId, 'AnimationComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    const hurtBox = assertExists(this.ecs.getComponent(entityId, 'HurtboxComponent'))
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    
    // Stop horizontal movement during attack (unless airborne)
    if (body.touchingDown) {
      body.velocity[0] = 0
    }
    
    // Enable sword per frame bits and set rect per facing
    const curFrame = anim.animation.frames[anim.frameIndex]!
    const active = hasFrameFlag(curFrame.flags, AnimationFrameFlag.SwordSwing)
    hurtBox.enabled = active
    if (active) {
      hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_LEFT : SWORD_HURTBOX_RIGHT
    }
    // Transition out when animation can be interrupted or is complete
    if (anim.hasCompleted || hasFrameFlag(curFrame.flags, AnimationFrameFlag.CanInterrupt)) {
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
        body.velocity[0] = facing.value === Facing.RIGHT ? -HURT_VX : HURT_VX
        body.velocity[1] = HURT_VY
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
    
    rec.ticks -= 1
    if (rec.ticks <= 0) {
      // Check ground contact to determine next state
      const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
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
