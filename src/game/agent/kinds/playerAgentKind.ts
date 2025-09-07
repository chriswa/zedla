import { singleton } from 'tsyringe'

import type { IAgentKind } from '../agentKind'
import { ECS } from '../../ecs/ecs'
import type { EntityId, EntityComponentMap } from '../../ecs/ecs'
import type { RoomContext } from '../../roomContext'
import { Input, Button } from '@/app/input'
import { Facing } from '@/types/facing'
import { PhysicsBodyComponent, HitboxComponent, FacingComponent, HurtboxComponent } from '@/game/ecs/components'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { createCombatMask, CombatBit } from '@/types/combat'
import { animationDefs } from '@/resources/animationDefs'
import { AnimationController } from '../animationController'
import { assertExists } from '@/util/assertExists'

// Movement constants ported from legacy code (converted to px/s and px/s^2)
// NOTE: Values intentionally halved to match current pixel scale (per user’s tuning).
const MAX_X_SPEED = 0.1 * 1000 // 100 px/s
const WALK_ACCEL = 0.00125 * 1_000_000 // 1250 px/s^2
const WALK_DECEL = 0.0005 * 1_000_000 // 500 px/s^2
const AIR_ACCEL  = 0.0006 * 1_000_000 // 600 px/s^2
const GRAVITY_Y  = 0.0020 * 1_000_000 // 2000 px/s^2
const JUMP_VY    = -0.300 * 1000      // -300 px/s
const JUMP_HOLD_BOOST = 0.00075 * 1_000_000 // 750 px/s^2
// Running jump boost reduces upward acceleration proportional to speed (per-second form)
const RUN_JUMP_BOOST_PER_SPEED = 3.25 // px/s^2 per (px/s)

const ZERO_THRESHOLD_SPEED = 0.01 * 1000 // 10 px/s
const TICK_MS = 1000 / 60
const JUMP_GRACE_MS = 50

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_BASE = rect.createFromCorners(-8, -20, 8, -2)
const SWORD_HURTBOX_RIGHT = rect.add(SWORD_HURTBOX_BASE, vec2.create(20, 0))
const SWORD_HURTBOX_LEFT  = rect.add(SWORD_HURTBOX_BASE, vec2.create(-20, 0))

interface PlayerSpawnData {
}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    private input: Input,
  ) {}
  private animationController = new AnimationController('link')
  private state = new Map<EntityId, { fallMs: number }>()

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    // Player sword hurtbox (disabled by default; enabled during attack frames)
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.createFromCorners(12, -20, 28, -2), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))
    this.state.set(entityId, { fallMs: 9999 })
  }

  tick(entityId: EntityId, components: EntityComponentMap, _room: RoomContext): void {
    const body = components.PhysicsBodyComponent
    if (!body) return

    const left = this.input.isDown(Button.LEFT)
    const right = this.input.isDown(Button.RIGHT)
    const jumpHit = this.input.wasHitThisTick(Button.JUMP)
    const jumpHeld = this.input.isDown(Button.JUMP)

    // Facing updates anytime
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    if (left && !right) facing.value = Facing.LEFT
    else if (right && !left) facing.value = Facing.RIGHT

    // Coyote time / grace
    const s = this.state.get(entityId) ?? { fallMs: 9999 }
    const onGround = body.touchingDown === true
    if (onGround) s.fallMs = 0
    else s.fallMs += TICK_MS
    this.state.set(entityId, s)

    // Jump
    if (jumpHit && s.fallMs < JUMP_GRACE_MS) {
      body.velocity[1] = JUMP_VY
      s.fallMs = 9999
    }

    // Horizontal acceleration
    let ax = 0
    if (onGround) {
      if (left && !right) ax = -WALK_ACCEL
      else if (right && !left) ax = WALK_ACCEL
      else {
        // ground decel
        if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) body.velocity[0] = 0
        else ax = -WALK_DECEL * Math.sign(body.velocity[0]!)
      }
    } else {
      if (left && !right) ax = -AIR_ACCEL
      else if (right && !left) ax = AIR_ACCEL
    }

    // Vertical acceleration (gravity + jump modifiers)
    let ay = GRAVITY_Y
    if (body.velocity[1]! < 0) {
      // running jump boost: reduces upward accel based on speed
      ay -= RUN_JUMP_BOOST_PER_SPEED * Math.abs(body.velocity[0]!)
      // hold to jump higher
      if (jumpHeld) ay -= JUMP_HOLD_BOOST
    }

    // Integrate velocities (semi-implicit Euler) using fixed 60 Hz
    body.velocity[0]! += ax / 60
    body.velocity[1]! += ay / 60

    // Clamp horizontal speed
    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))

    // Sword hurtbox: enable during specific attack frames and position based on facing
    const anim = assertExists(this.ecs.getComponent(entityId, 'AnimationComponent'))
    const hurt = assertExists(this.ecs.getComponent(entityId, 'HurtboxComponent'))
    const isAttack = anim.animation === animationDefs.link.attack
    const isCrouchAttack = anim.animation === animationDefs.link['crouch-attack']
    const active = (isAttack && anim.frameIndex === 1) || (isCrouchAttack && anim.frameIndex === 0)
    hurt.enabled = active
    if (active) {
      hurt.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_LEFT : SWORD_HURTBOX_RIGHT
    }

    // Process and clear mailbox (if present)
    const mailbox = components.MailboxComponent
    if (mailbox) mailbox.eventQueue.length = 0
  }

  onDestroy(_entityId: EntityId): void {}
}
