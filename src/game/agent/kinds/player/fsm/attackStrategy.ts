import { PlayerAnimationBehavior } from '../behaviors/playerAnimationBehavior'
import { ATTACK_CROUCH_CAN_INTERRUPT_TICK, ATTACK_CROUCH_SWORD_END_TICK, ATTACK_CROUCH_SWORD_START_TICK, ATTACK_CROUCH_TOTAL_TICKS, ATTACK_STANDING_CAN_INTERRUPT_TICK, ATTACK_STANDING_SWORD_END_TICK, ATTACK_STANDING_SWORD_START_TICK, ATTACK_STANDING_TOTAL_TICKS, PlayerCombatBehavior } from '../behaviors/playerCombatBehavior'
import { GRAVITY } from '../behaviors/playerMovementBehavior'
import { PlayerStrategyFsmClassMapKeys } from './_classMapKeys.hbs'
import { Button, Input } from '@/app/input'
import { AgentContext } from '@/game/agent/agentContext'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { Facing } from '@/types/facing'
import { assertExists } from '@/util/assertExists'
import { FsmStrategy } from '@/util/fsm'
import { singleton } from 'tsyringe'

// Sword hurtbox rectangles (local to player origin); centered base shifted left/right
const SWORD_HURTBOX_STANDING_BASE = rect.createCentred(0, -21, 18, 4)
const SWORD_HURTBOX_STANDING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, 0))
const SWORD_HURTBOX_STANDING_LEFT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, 0))

const SWORD_CROUCH_OFFSET_Y = 13
const SWORD_HURTBOX_CROUCHING_RIGHT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(15, SWORD_CROUCH_OFFSET_Y))
const SWORD_HURTBOX_CROUCHING_LEFT = rect.add(SWORD_HURTBOX_STANDING_BASE, vec2.create(-15, SWORD_CROUCH_OFFSET_Y))

@singleton()
export class AttackStrategy implements FsmStrategy<AgentContext, PlayerStrategyFsmClassMapKeys> {
  private attackData = new Map<EntityId, { isCrouching: boolean, startedAirborne: boolean }>()

  constructor(
    private ecs: ECS,
    private input: Input,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private playerCombatBehavior: PlayerCombatBehavior,
  ) {}

  // Snapshot crouch decision on enter by DOWN held and current groundedness
  onEnter(agentContext: AgentContext): void {
    const entityId = agentContext.entityId
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const isCrouching = this.input.isDown(Button.DOWN) && body.touchingDown
    const startedAirborne = !body.touchingDown

    // Store attack data for this entity
    this.attackData.set(entityId, { isCrouching, startedAirborne })

    // Start attack timer
    this.playerCombatBehavior.startAttackTimer(agentContext)

    // Start animation (visual only, gameplay uses timer)
    this.playerAnimationBehavior.startAnimation(this.ecs, entityId, isCrouching ? 'crouch-attack' : 'attack')
  }

  onExit(agentContext: AgentContext): void {
    const entityId = agentContext.entityId
    // Disable hurtbox when leaving attack state
    const hurtBox = this.ecs.getComponent(entityId, 'HurtboxComponent')
    hurtBox.enabled = false

    // Clean up attack data
    this.attackData.delete(entityId)
  }

  update(agentContext: AgentContext): PlayerStrategyFsmClassMapKeys | undefined {
    const entityId = agentContext.entityId
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')
    const hurtBox = this.ecs.getComponent(entityId, 'HurtboxComponent')
    const body = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    const attackData = assertExists(this.attackData.get(entityId))

    // Stop horizontal movement during attack only when grounded
    if (body.touchingDown) {
      body.velocity[0] = 0
    }

    // Apply gravity (attacks can happen in air)
    const dt = 1000 / 60
    body.velocity[1]! += GRAVITY * dt

    // Get attack timing based on crouch state
    const attackTick = this.playerCombatBehavior.getAttackElapsedTicks(agentContext)
    const swordStartTick = attackData.isCrouching ? ATTACK_CROUCH_SWORD_START_TICK : ATTACK_STANDING_SWORD_START_TICK
    const swordEndTick = attackData.isCrouching ? ATTACK_CROUCH_SWORD_END_TICK : ATTACK_STANDING_SWORD_END_TICK
    const canInterruptTick = attackData.isCrouching ? ATTACK_CROUCH_CAN_INTERRUPT_TICK : ATTACK_STANDING_CAN_INTERRUPT_TICK
    const totalTicks = attackData.isCrouching ? ATTACK_CROUCH_TOTAL_TICKS : ATTACK_STANDING_TOTAL_TICKS

    // Enable sword hurtbox during active window
    const swordActive = attackTick >= swordStartTick && attackTick < swordEndTick
    hurtBox.enabled = swordActive
    if (swordActive) {
      if (attackData.isCrouching) {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_CROUCHING_LEFT : SWORD_HURTBOX_CROUCHING_RIGHT
      }
      else {
        hurtBox.rect = (facing.value === Facing.LEFT) ? SWORD_HURTBOX_STANDING_LEFT : SWORD_HURTBOX_STANDING_RIGHT
      }
    }

    // Check if we just landed (was airborne attack, now touching ground)
    const justLanded = attackData.startedAirborne && body.touchingDown && body.velocity[1]! >= 0

    // Transition out when attack is complete, can be interrupted, or just landed
    const attackComplete = attackTick >= totalTicks
    const canInterrupt = attackTick >= canInterruptTick

    if (attackComplete || canInterrupt || justLanded) {
      return body.touchingDown ? 'GroundedStrategy' : 'AirborneStrategy'
    }
    return undefined
  }
}
