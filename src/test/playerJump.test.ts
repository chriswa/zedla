import { Button } from '@/app/input'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { AgentSystem } from '@/game/ecs/systems/agentSystem'
import { GameContext } from '@/game/gameContext'
import { RoomContext } from '@/game/roomContext'
import { vec2 } from '@/math/vec2'
import { TestInput } from '@/test/doubles/testInput'
import { container } from 'tsyringe'
import { beforeEach, describe, expect, it } from 'vitest'

const JUMP_IMPULSE = 0.60000
const JUMP_INPUT_BUFFER_TICKS = 6

/**
 * High-level test harness for player jump mechanics
 * Provides clean API for setting up scenarios and asserting outcomes
 */
class PlayerJumpTestHarness {
  private ecs: ECS
  private agentSystem: AgentSystem
  private testInput: TestInput
  private gameContext: GameContext
  private roomContext: RoomContext
  private playerEntityId!: EntityId
  private velocityYHistory: Array<{ tick: number, vy: number }> = []

  constructor() {
    this.ecs = container.resolve(ECS)
    this.agentSystem = container.resolve(AgentSystem)
    this.testInput = container.resolve(TestInput)
    this.gameContext = { currentTick: 0, currentRoomDefKey: 'intro1' }

    // Create minimal room context with fake room def
    const sceneId = this.ecs.allocateSceneId()
    this.roomContext = new RoomContext(
      sceneId,
      {
        physicsTilemap: { tileSize: 16, tiles: new Uint16Array(0), cols: 1 },
        backgroundTilemaps: [],
        spawns: [],
      },
      this.gameContext,
    )
  }

  /**
   * Spawn player and prepare for testing
   */
  setupPlayer(): void {
    this.playerEntityId = this.agentSystem.spawnAgent(
      this.roomContext.sceneId,
      'PlayerAgentKind',
      vec2.create(0, 0),
      {},
    )

    // Set initial grounded state
    this.setGrounded(true)
  }

  /**
   * Simulate one game tick with specified input and physics state
   */
  simulateTick(options: {
    jumpPressed?: boolean
    jumpHeld?: boolean
    grounded?: boolean
  } = {}): void {
    // Set input state
    if (options.jumpPressed) {
      this.testInput.simulateButtonPress(Button.JUMP)
    }
    else if (options.jumpHeld) {
      // Keep jump held (don't add hit, just keep down)
    }
    else {
      this.testInput.simulateButtonRelease(Button.JUMP)
    }

    // Sample input to make it available to game logic
    this.testInput.sample()

    // Set physics state if specified
    if (options.grounded !== undefined) {
      this.setGrounded(options.grounded)
    }

    // Increment game tick
    this.gameContext.currentTick += 1

    // Run agent system tick (this processes all agents including FSM and behaviors)
    this.agentSystem.tick(this.roomContext)

    // Record vertical velocity after tick
    this.velocityYHistory.push({
      tick: this.gameContext.currentTick,
      vy: this.getVerticalVelocity(),
    })
  }

  /**
   * Set player grounded state
   */
  setGrounded(grounded: boolean): void {
    const body = this.ecs.getComponent(this.playerEntityId, 'PhysicsBodyComponent')
    body.touchingDown = grounded
  }

  /**
   * Get current vertical velocity (negative = upward)
   */
  getVerticalVelocity(): number {
    const body = this.ecs.getComponent(this.playerEntityId, 'PhysicsBodyComponent')
    return body.velocity[1]!
  }

  /**
   * Assert that player jumped on a specific tick
   */
  expectJumpedOnTick(tick: number): void {
    const record = this.velocityYHistory.find((r) => r.tick === tick)
    expect(record).toBeDefined()
    // Velocity should be upward (negative) and close to jump impulse
    expect(record!.vy).toBeLessThan(-0.5) // Upward velocity after gravity applied
    expect(record!.vy).toBeGreaterThan(-JUMP_IMPULSE - 0.1) // Within reasonable range
  }

  /**
   * Assert that player did NOT jump on a specific tick
   */
  expectNoJumpOnTick(tick: number): void {
    const record = this.velocityYHistory.find((r) => r.tick === tick)
    expect(record).toBeDefined()
    // If jumped, velocity would be strongly negative (upward)
    expect(Math.abs(record!.vy + JUMP_IMPULSE)).toBeGreaterThan(0.05)
  }

  /**
   * Assert that player jumped ONLY on the specified tick (and no other ticks)
   */
  expectJumpedOnlyOnTick(tick: number): void {
    // Verify jump happened on specific tick
    this.expectJumpedOnTick(tick)

    // Verify no jumps on any other ticks
    for (const record of this.velocityYHistory) {
      if (record.tick !== tick) {
        expect(Math.abs(record.vy + JUMP_IMPULSE)).toBeGreaterThan(0.05)
      }
    }
  }

  /**
   * Assert that player just jumped (checks most recent tick)
   * Convenience method for backward compatibility with existing tests
   */
  expectJumped(): void {
    const lastTick = this.gameContext.currentTick
    this.expectJumpedOnTick(lastTick)
  }

  /**
   * Assert that player did not jump (checks most recent tick)
   * Convenience method for backward compatibility with existing tests
   */
  expectNotJumped(): void {
    const lastTick = this.gameContext.currentTick
    this.expectNoJumpOnTick(lastTick)
  }

  /**
   * Set vertical velocity manually (useful for simulating fall)
   */
  setVerticalVelocity(velocity: number): void {
    const body = this.ecs.getComponent(this.playerEntityId, 'PhysicsBodyComponent')
    body.velocity[1] = velocity
  }
}

describe('Player Jump Mechanics', () => {
  let harness: PlayerJumpTestHarness

  beforeEach(() => {
    container.clearInstances()
    harness = new PlayerJumpTestHarness()
    harness.setupPlayer()
  })

  describe('Coyote Time', () => {
    it('should allow jump within coyote time window after leaving ground', () => {
      // Player walks off edge (tick 1)
      harness.simulateTick({ grounded: false })

      // Wait one tick (tick 2)
      harness.simulateTick({ grounded: false })

      // Press jump 2 ticks after leaving ground (tick 3, within 3-tick window)
      harness.simulateTick({ grounded: false, jumpPressed: true })

      // Verify jump happened only on tick 3, not on ticks 1 or 2
      harness.expectJumpedOnlyOnTick(3)
    })

    it('should allow jump on last tick of coyote time window', () => {
      // Player walks off edge
      harness.simulateTick({ grounded: false })

      // Press jump exactly 2 ticks after leaving ground (last valid tick)
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false, jumpPressed: true })

      harness.expectJumped()
    })

    it('should NOT allow jump after coyote time window expires', () => {
      // Player walks off edge
      harness.simulateTick({ grounded: false })

      // Wait past coyote time window (3+ ticks)
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })

      // Try to jump - should fail
      harness.simulateTick({ grounded: false, jumpPressed: true })

      harness.expectNotJumped()
    })

    it('should allow immediate jump when leaving ground (0 ticks elapsed)', () => {
      // Player leaves ground and immediately presses jump on same tick
      harness.simulateTick({ grounded: false, jumpPressed: true })

      harness.expectJumped()
    })
  })

  describe('Jump Input Buffering', () => {
    it('should execute buffered jump when landing', () => {
      // Player is airborne
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.setVerticalVelocity(0.1) // Falling down

      // Press jump while in air (outside coyote window)
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false, jumpPressed: true })

      // Land on ground - buffered jump should execute
      harness.simulateTick({ grounded: true })

      harness.expectJumped()
    })

    it('should execute buffered jump within buffer window', () => {
      // Player is airborne
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.setVerticalVelocity(0.1)

      // Press jump 5 ticks before landing (within 6-tick buffer)
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false, jumpPressed: true })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })

      // Land - should still execute buffered jump
      harness.simulateTick({ grounded: true })

      harness.expectJumped()
    })

    it('should NOT execute buffered jump after buffer window expires', () => {
      // Player is airborne
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.setVerticalVelocity(0.1)

      // Press jump, then wait past buffer window (6+ ticks)
      harness.simulateTick({ grounded: false, jumpPressed: true })
      for (let i = 0; i < JUMP_INPUT_BUFFER_TICKS; i++) {
        harness.simulateTick({ grounded: false })
      }

      // Land - buffered jump should have expired
      harness.simulateTick({ grounded: true })

      harness.expectNotJumped()
    })

    it('should buffer most recent jump input when pressed multiple times', () => {
      // Player is airborne
      harness.simulateTick({ grounded: false })
      harness.setVerticalVelocity(0.1)

      // Press jump multiple times - only last one matters
      harness.simulateTick({ grounded: false, jumpPressed: true })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false, jumpPressed: true }) // Most recent

      // Reset velocity to simulate landing (falling downward)
      harness.setVerticalVelocity(0.1)

      // Land immediately after last press
      harness.simulateTick({ grounded: true })

      harness.expectJumped()
    })
  })

  describe('Normal Jumping', () => {
    it('should allow normal jump from grounded state', () => {
      harness.simulateTick({ grounded: true, jumpPressed: true })

      harness.expectJumped()
    })

    it('should NOT allow jump when fully airborne outside coyote window', () => {
      // Go fully airborne (past coyote time)
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })
      harness.simulateTick({ grounded: false })

      // Try to jump
      harness.simulateTick({ grounded: false, jumpPressed: true })

      harness.expectNotJumped()
    })
  })
})
