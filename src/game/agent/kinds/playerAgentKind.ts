import { singleton, inject, delay } from 'tsyringe'

import type { IAgentKind } from '../agentKind'
import { ECS } from '../../ecs/ecs'
import type { EntityId, EntityComponentMap } from '../../ecs/ecs'
import type { RoomContext } from '../../roomContext'
import { Input, Button } from '@/app/input'
import { Facing } from '@/types/facing'
import { PhysicsBodyComponent, HitboxComponent, FacingComponent, HurtboxComponent } from '@/game/ecs/components'
import { rect } from '@/math/rect'
import { vec2, type Vec2 } from '@/math/vec2'
import { createCombatMask, CombatBit } from '@/types/combat'
import { hasFrameFlag, AnimationFrameFlag } from '@/types/animationFlags'
import { AnimationController } from '../animationController'
import { assertExists } from '@/util/assertExists'
import { FSM } from '@/util/fsm'
import { assert } from '@/util/assert'
import { CanvasLog } from '@/dev/canvasLog'

const MAX_X_SPEED = 0.1 * 1000
const WALK_ACCEL = 0.00125 * 1_000_000
const WALK_DECEL = 0.0005 * 1_000_000
const AIR_ACCEL  = 0.0006 * 1_000_000
const GRAVITY_Y  = 0.0020 * 1_000_000
const JUMP_VY    = -0.300 * 1000
const JUMP_HOLD_BOOST = 0.00075 * 1_000_000
const RUN_JUMP_BOOST_PER_SPEED = 3.25

const ZERO_THRESHOLD_SPEED = 0.01 * 1000
const JUMP_GRACE_TICKS = 3

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_BASE = rect.createCentred(0, -21, 18, 4)
const SWORD_HURTBOX_RIGHT = rect.add(SWORD_HURTBOX_BASE, vec2.create(15, 0))
const SWORD_HURTBOX_LEFT  = rect.add(SWORD_HURTBOX_BASE, vec2.create(-15, 0))

interface PlayerSpawnData {
}

interface PlayerFsmCtx { fallTicks: number }

interface PlayerFsmState {
  update(entityId: EntityId, ctx: PlayerFsmCtx): (() => PlayerFsmState) | undefined
  onEnter(entityId: EntityId, ctx: PlayerFsmCtx): void
  onExit(): void
}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    @inject(delay(() => GroundedState)) private groundedState: GroundedState,
  ) {}
  private animationController = new AnimationController('link')
  private perEntity = new Map<EntityId, { ctx: PlayerFsmCtx; fsm: FSM<PlayerFsmState> }>()

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(SWORD_HURTBOX_BASE, createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))

    const fsm = new FSM<PlayerFsmState>(this.groundedState)
    const ctx: PlayerFsmCtx = { fallTicks: 9999 }
    // immediate enter for initial state
    fsm.active.onEnter(entityId, ctx)
    this.perEntity.set(entityId, { ctx, fsm })
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    const { fsm, ctx } = assertExists(this.perEntity.get(entityId))
    const MAX_TRANSITIONS = 3
    let transitions = 0
    for (;;) {
      const nextFactory = fsm.active.update(entityId, ctx)
      if (!nextFactory) break
      const prevName = fsm.active.constructor.name
      const nextInstance = nextFactory()
      const nextName = nextInstance.constructor.name
      fsm.queueStateFactory(() => nextInstance)
      const changed = fsm.processQueuedState()
      if (changed) {
        transitions += 1
        // eslint-disable-next-line no-console
        console.log(`[PlayerFSM] ${transitions}: ${prevName} -> ${nextName}`)
        assert(transitions <= MAX_TRANSITIONS, `player FSM exceeded max transitions: ${prevName} -> ${nextName}`)
        fsm.active.onEnter(entityId, ctx)
        continue
      }
      break
    }
  }

  onDestroy(_entityId: EntityId): void {}
}

// ------------------ States ------------------

@singleton()
class GroundedState implements PlayerFsmState {
  constructor(
    private ecs: ECS,
    private input: Input,
    private helper: PlayerHelper,
    @inject(delay(() => AirborneState)) private airborne: AirborneState,
    @inject(delay(() => AttackState)) private attack: AttackState,
  ) {}
  onEnter(_entityId: EntityId, ctx: PlayerFsmCtx): void {
    // reset coyote timer on solid ground
    ctx.fallTicks = 0
  }
  onExit(): void {}
  update(entityId: EntityId, ctx: PlayerFsmCtx): (() => PlayerFsmState) | undefined {
    const hurtNext = this.helper.checkForHurt(entityId)
    if (hurtNext) return hurtNext
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    // Facing
    if (this.input.isDown(Button.LEFT) && !this.input.isDown(Button.RIGHT)) facing.value = Facing.LEFT
    else if (this.input.isDown(Button.RIGHT) && !this.input.isDown(Button.LEFT)) facing.value = Facing.RIGHT

    // Horizontal
    let ax = 0
    if (this.input.isDown(Button.LEFT) && !this.input.isDown(Button.RIGHT)) ax = -WALK_ACCEL
    else if (this.input.isDown(Button.RIGHT) && !this.input.isDown(Button.LEFT)) ax = WALK_ACCEL
    else {
      if (Math.abs(body.velocity[0]!) < ZERO_THRESHOLD_SPEED) body.velocity[0] = 0
      else ax = -WALK_DECEL * Math.sign(body.velocity[0]!)
    }
    // Vertical accel (gravity minimal since grounded; keep GRAVITY_Y to hug ground)
    let ay = GRAVITY_Y

    // Integrate
    body.velocity[0]! += ax / 60
    body.velocity[1]! += ay / 60
    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))

    // Jump
    if (this.input.wasHitThisTick(Button.JUMP) && ctx.fallTicks < JUMP_GRACE_TICKS) {
      body.velocity[1] = JUMP_VY
      ctx.fallTicks = 9999
      return () => this.airborne
    }
    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return () => this.attack
    }
    // If no longer contacting ground, start counting fall ticks and go airborne
    const onGround = body.touchingDown === true
    if (!onGround) {
      return () => this.airborne
    }
    return undefined
  }
}

@singleton()
class AirborneState implements PlayerFsmState {
  constructor(
    private ecs: ECS,
    private input: Input,
    private helper: PlayerHelper,
    @inject(delay(() => GroundedState)) private grounded: GroundedState,
    @inject(delay(() => AttackState)) private attack: AttackState,
  ) {}
  onEnter(_entityId: EntityId, _ctx: PlayerFsmCtx): void {}
  onExit(): void {}
  update(entityId: EntityId, ctx: PlayerFsmCtx): (() => PlayerFsmState) | undefined {
    const hurtNext = this.helper.checkForHurt(entityId)
    if (hurtNext) return hurtNext
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    // Facing
    if (this.input.isDown(Button.LEFT) && !this.input.isDown(Button.RIGHT)) facing.value = Facing.LEFT
    else if (this.input.isDown(Button.RIGHT) && !this.input.isDown(Button.LEFT)) facing.value = Facing.RIGHT

    // Count fall
    ctx.fallTicks += 1

    // Horizontal air control
    let ax = 0
    if (this.input.isDown(Button.LEFT) && !this.input.isDown(Button.RIGHT)) ax = -AIR_ACCEL
    else if (this.input.isDown(Button.RIGHT) && !this.input.isDown(Button.LEFT)) ax = AIR_ACCEL

    // Vertical accel (gravity + jump modifiers)
    let ay = GRAVITY_Y
    if (body.velocity[1]! < 0) {
      ay -= RUN_JUMP_BOOST_PER_SPEED * Math.abs(body.velocity[0]!)
      if (this.input.isDown(Button.JUMP)) ay -= JUMP_HOLD_BOOST
    }

    body.velocity[0]! += ax / 60
    body.velocity[1]! += ay / 60
    body.velocity[0] = Math.max(-MAX_X_SPEED, Math.min(MAX_X_SPEED, body.velocity[0]!))

    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return () => this.attack
    }
    // Landed?
    if (body.touchingDown === true) {
      return () => this.grounded
    }
    return undefined
  }
}

@singleton()
class AttackState implements PlayerFsmState {
  constructor(
    private ecs: ECS,
    private input: Input,
    private helper: PlayerHelper,
    @inject(delay(() => GroundedState)) private grounded: GroundedState,
  ) {}
  // Snapshot crouch decision on enter by DOWN held and current groundedness
  onEnter(entityId: EntityId, _ctx: PlayerFsmCtx): void {
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    const isCrouching = this.input.isDown(Button.DOWN) && body.touchingDown === true
    new AnimationController<'link'>('link').startAnimation(this.ecs, entityId, isCrouching ? 'crouch-attack' : 'attack')
  }
  onExit(): void {
    // ensure return to stand when exiting early
    // handled by next state's onEnter
  }
  update(entityId: EntityId, _ctx: PlayerFsmCtx): (() => PlayerFsmState) | undefined {
    const hurtNext = this.helper.checkForHurt(entityId)
    if (hurtNext) return hurtNext
    const anim = assertExists(this.ecs.getComponent(entityId, 'AnimationComponent'))
    const facing = assertExists(this.ecs.getComponent(entityId, 'FacingComponent'))
    const hurtBox = assertExists(this.ecs.getComponent(entityId, 'HurtboxComponent'))
    // Enable sword per frame bits and set rect per facing
    const curFrame = anim.animation.frames[anim.frameIndex]!
    const active = hasFrameFlag(curFrame.flags, AnimationFrameFlag.SwordSwing)
    hurtBox.enabled = active
    if (active) {
      hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_LEFT : SWORD_HURTBOX_RIGHT
    }
    // Transition out when animation ends
    if (!anim.animation.loop && anim.frameIndex >= anim.animation.frames.length - 1) {
      return () => this.grounded
    }
    return undefined
  }
}

@singleton()
class HurtState implements PlayerFsmState {
  private info = new Map<EntityId, { ticks: number; prevHitboxEnabled: boolean }>()
  constructor(private ecs: ECS, @inject(delay(() => GroundedState)) private grounded: GroundedState) {}
  recordHit(entityId: EntityId, attackVec2: Vec2) {
    const body = assertExists(this.ecs.getComponent(entityId, 'PhysicsBodyComponent'))
    // Knockback away from attacker
    body.velocity[0] = (attackVec2[0]! >= 0 ? HURT_VX : -HURT_VX)
    body.velocity[1] = JUMP_HURT_VY
    const hitbox = this.ecs.getComponent(entityId, 'HitboxComponent')
    const prev = hitbox ? (hitbox as HitboxComponent).enabled : true
    if (hitbox) (hitbox as HitboxComponent).enabled = false
    this.info.set(entityId, { ticks: HURT_TICKS, prevHitboxEnabled: prev })
  }
  onEnter(entityId: EntityId, _ctx: PlayerFsmCtx): void {
    // Set hurt animation
    const anim = this.ecs.getComponent(entityId, 'AnimationComponent')
    if (anim) new AnimationController<'link'>('link').startAnimation(this.ecs, entityId, 'hurt')
  }
  onExit(): void {}
  update(entityId: EntityId, _ctx: PlayerFsmCtx): (() => PlayerFsmState) | undefined {
    const rec = this.info.get(entityId)
    if (!rec) return () => this.grounded
    rec.ticks -= 1
    if (rec.ticks <= 0) {
      const hitbox = this.ecs.getComponent(entityId, 'HitboxComponent')
      if (hitbox && rec) (hitbox as HitboxComponent).enabled = rec.prevHitboxEnabled
      this.info.delete(entityId)
      return () => this.grounded
    }
    return undefined
  }
}

// Constants for hurt
const HURT_VX = 0.075 * 1000 // 75 px/s
const JUMP_HURT_VY = -0.200 * 1000 // -200 px/s upward
const HURT_TICKS = Math.round(0.4 * 60) // ~400ms

@singleton()
class PlayerHelper {
  constructor(private ecs: ECS, private canvasLog: CanvasLog, @inject(delay(() => HurtState)) private hurtState: HurtState) {}
  checkForHurt(entityId: EntityId): (() => PlayerFsmState) | undefined {
    const mailbox = this.ecs.getComponent(entityId, 'MailboxComponent')
    if (!mailbox || mailbox.eventQueue.length === 0) return undefined
    for (const mail of mailbox.eventQueue) {
      if (mail.type === 'combat-hit') {
        const attackerKind = this.ecs.getComponent(mail.attackerId as EntityId, 'AgentKindComponent')?.kind ?? 'Unknown'
        this.canvasLog.postEphemeral(`Player hurt by ${String(attackerKind)} ${vec2.toString(mail.attackVec2)}`)
        this.hurtState.recordHit(entityId, mail.attackVec2)
        mailbox.eventQueue.length = 0
        return () => this.hurtState
      }
    }
    mailbox.eventQueue.length = 0
    return undefined
  }
}
