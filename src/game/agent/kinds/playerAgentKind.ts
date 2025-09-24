import { Button, Input } from '@/app/input'
import { CanvasLog } from '@/dev/canvasLog'
import { IAgentKind } from '@/game/agent/agentKind'
import { AnimationBehavior } from '@/game/agent/behaviors/animationBehavior'
import { CombatBehavior } from '@/game/agent/behaviors/combatBehavior'
import { InvulnerabilityBehavior } from '@/game/agent/behaviors/invulnerabilityBehavior'
import { MailboxService } from '@/game/agent/behaviors/mailboxService'
import { PlayerMovementBehavior } from '@/game/agent/behaviors/playerMovementBehavior'
import { FacingComponent, HitboxComponent, HurtboxComponent, InvulnerabilityComponent, PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { AnimationFrameFlag } from '@/types/animationFlags'
import { CombatBit, createCombatMask } from '@/types/combat'
import { Facing } from '@/types/facing'
import { InvulnerabilityBit } from '@/types/invulnerability'
import { assert } from '@/util/assert'
import { assertExists } from '@/util/assertExists'
import { Fsm, FsmStrategy } from '@/util/fsm'
import { container, singleton } from 'tsyringe'

const HURT_IMPULSE_X = 0.15000
const HURT_IMPULSE_Y = 0.40000
const HURT_TICKS = Math.round(0.4 * 60) // ~400ms

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_STANDING_BASE = rect.createCentred(0, -21, 18, 4)
const SWORD_HURTBOX_STANDING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, 0))
const SWORD_HURTBOX_STANDING_LEFT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, 0))

const SWORD_CROUCH_OFFSET_Y = 13
const SWORD_HURTBOX_CROUCHING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, SWORD_CROUCH_OFFSET_Y))
const SWORD_HURTBOX_CROUCHING_LEFT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, SWORD_CROUCH_OFFSET_Y))

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PlayerSpawnData {
}

interface PlayerEntityData {
  fsm: Fsm<PlayerFsmStrategy, EntityId>
}

type PlayerFsmStrategy = FsmStrategy<EntityId>

@singleton()
class PlayerEntityDataManager extends EntityDataManager<PlayerEntityData> {}

@singleton()
export class PlayerAnimationBehavior extends AnimationBehavior<'link'> {
  constructor() { super('link') }
}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    private playerEntityDataManager: PlayerEntityDataManager,
    private playerMovementBehavior: PlayerMovementBehavior,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private canvasLog: CanvasLog,
  ) {}

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.playerAnimationBehavior.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand', 1)
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(SWORD_HURTBOX_STANDING_BASE, createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))
    this.ecs.addComponent(entityId, 'InvulnerabilityComponent', new InvulnerabilityComponent())

    // Initialize movement data
    this.playerMovementBehavior.createMovementData(entityId)

    // Initialize player data with FSM
    const fsm = new Fsm<PlayerFsmStrategy, EntityId>(playerStrategyRegistry.GroundedStrategy)
    this.playerEntityDataManager.onCreate(entityId, {
      fsm: fsm,
    })
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    const data = this.playerEntityDataManager.get(entityId)
    data.fsm.process(entityId)

    const physics = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    this.canvasLog.upsertPermanent('playerPhysics', `p.v = ${vec2.toString(physics.velocity)}`, 3)
  }

  onDestroy(entityId: EntityId): void {
    this.playerMovementBehavior.destroyMovementData(entityId)
    this.playerEntityDataManager.onDestroy(entityId)
  }
}

// ------------------ Strategies ------------------

@singleton()
class GroundedStrategy implements PlayerFsmStrategy {
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
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.combatBehavior.checkForHurt(entityId)) { return playerStrategyRegistry.HurtStrategy }
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
        return playerStrategyRegistry.AirborneStrategy
      }
    }
    // Attack
    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return playerStrategyRegistry.AttackStrategy
    }
    // If no longer contacting ground, start counting fall ticks and go airborne
    if (!body.touchingDown) {
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
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerMovementBehavior: PlayerMovementBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  onEnter(entityId: EntityId): void {
    // Start with jump animation when entering airborne state
    this.playerAnimationBehavior.playAnimation(this.ecs, entityId, 'jump')
  }

  onExit(_entityId: EntityId): void {}
  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.combatBehavior.checkForHurt(entityId)) { return playerStrategyRegistry.HurtStrategy }
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Facing and horizontal air control
    const inputDirection = this.input.getHorizontalInputDirection()
    const jumpHeld = this.input.isDown(Button.JUMP)

    // Count fall and apply air movement
    this.playerMovementBehavior.incrementFallTicks(entityId)
    this.playerMovementBehavior.applyAirMovement(entityId, inputDirection, jumpHeld)

    if (this.input.wasHitThisTick(Button.ATTACK)) {
      return playerStrategyRegistry.AttackStrategy
    }
    // Landed? Only transition to grounded if we're moving downward (or stopped vertically)
    if (body.touchingDown && body.velocity[1]! >= 0) {
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
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private combatBehavior: CombatBehavior,
  ) {}

  // Snapshot crouch decision on enter by DOWN held and current groundedness
  onEnter(entityId: EntityId): void {
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const isCrouching = this.input.isDown(Button.DOWN) && body.touchingDown
    const startedAirborne = !body.touchingDown

    // Store attack data for this entity
    this.attackData.set(entityId, { isCrouching, startedAirborne })

    this.playerAnimationBehavior.startAnimation(this.ecs, entityId, isCrouching ? 'crouch-attack' : 'attack')
  }

  onExit(entityId: EntityId): void {
    // Disable hurtbox when leaving attack state
    const hurtBox = this.ecs.getComponent(entityId, 'HurtboxComponent')
    hurtBox.enabled = false

    // Clean up attack data
    this.attackData.delete(entityId)
  }

  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    if (this.combatBehavior.checkForHurt(entityId)) { return playerStrategyRegistry.HurtStrategy }
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')
    const hurtBox = this.ecs.getComponent(entityId, 'HurtboxComponent')
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Stop horizontal movement during attack only when grounded
    if (body.touchingDown) {
      body.velocity[0] = 0
    }

    // Apply gravity (attacks can happen in air)
    const dt = 1000 / 60
    body.velocity[1]! += 0.00400 * dt

    // Enable sword per frame bits and set rect per facing
    const active = this.playerAnimationBehavior.hasCurrentFrameFlag(this.ecs, entityId, AnimationFrameFlag.SwordSwing)
    const attackData = assertExists(this.attackData.get(entityId))

    hurtBox.enabled = active
    if (active) {
      if (attackData.isCrouching) {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_CROUCHING_LEFT : SWORD_HURTBOX_CROUCHING_RIGHT
      }
      else {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_STANDING_LEFT : SWORD_HURTBOX_STANDING_RIGHT
      }
    }
    // Check if we just landed (was airborne attack, now touching ground)
    const justLanded = attackData.startedAirborne && body.touchingDown && body.velocity[1]! >= 0

    // Transition out when animation can be interrupted, is complete, or just landed
    if (this.playerAnimationBehavior.isCompleted(this.ecs, entityId) ||
      this.playerAnimationBehavior.hasCurrentFrameFlag(this.ecs, entityId, AnimationFrameFlag.CanInterrupt) ||
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
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private mailboxService: MailboxService,
    private combatBehavior: CombatBehavior,
    private invulnerabilityBehavior: InvulnerabilityBehavior,
  ) {}

  onEnter(entityId: EntityId): void {
    // Process combat-hit mail from mailbox
    const combatHits = this.mailboxService.getMessagesOfType(entityId, 'combat-hit')
    assert(combatHits.length > 0)
    if (combatHits.length > 0) {
      const facing = this.ecs.getComponent(entityId, 'FacingComponent')
      // Knockback opposite to player's facing direction
      const velocityX = facing.value === Facing.RIGHT ? -HURT_IMPULSE_X : HURT_IMPULSE_X
      this.combatBehavior.applyKnockback(entityId, velocityX, -HURT_IMPULSE_Y)
      this.info.set(entityId, { ticks: HURT_TICKS })
    }
    this.mailboxService.clearMailbox(entityId)

    // Set invulnerable during hurt state
    this.invulnerabilityBehavior.setInvulnerable(entityId, InvulnerabilityBit.HURT)

    // Set hurt animation
    this.playerAnimationBehavior.startAnimation(this.ecs, entityId, 'hurt')
  }

  onExit(entityId: EntityId): void {
    // Clear hurt invulnerability when leaving hurt state
    this.invulnerabilityBehavior.clearInvulnerable(entityId, InvulnerabilityBit.HURT)

    // Clean up map entry
    this.info.delete(entityId)
  }

  update(entityId: EntityId): PlayerFsmStrategy | undefined {
    const rec = assertExists(this.info.get(entityId))
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')

    // Apply gravity during hurt state
    const dt = 1000 / 60
    body.velocity[1]! += 0.00400 * dt

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
