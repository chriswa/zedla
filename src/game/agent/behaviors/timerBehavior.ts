import { AgentContext } from '@/game/agent/agentContext'
import { AgentLifecycleConsumer } from '@/game/agent/agentLifecycleConsumer'
import { EntityId } from '@/game/ecs/ecs'
import { assertExists } from '@/util/assertExists'

export class TimerBehavior<TTimerKey extends string> implements AgentLifecycleConsumer {
  private timers = new Map<EntityId, Map<TTimerKey, number>>()

  afterSpawn(entityId: EntityId): void {
    this.timers.set(entityId, new Map())
  }

  beforeDestroy(entityId: EntityId): void {
    this.timers.delete(entityId)
  }

  setTimer(agentContext: AgentContext, key: TTimerKey): void {
    const entityTimers = assertExists(this.timers.get(agentContext.entityId))
    entityTimers.set(key, agentContext.roomContext.gameContext.currentTick)
  }

  maybeGetElapsedTicks(agentContext: AgentContext, key: TTimerKey): number | undefined {
    const entityTimers = assertExists(this.timers.get(agentContext.entityId))
    const startTick = entityTimers.get(key)
    if (startTick === undefined) { return undefined }
    return agentContext.roomContext.gameContext.currentTick - startTick
  }

  getElapsedTicks(agentContext: AgentContext, key: TTimerKey): number {
    return assertExists(this.maybeGetElapsedTicks(agentContext, key))
  }

  clearTimer(agentContext: AgentContext, key: TTimerKey): void {
    const entityTimers = assertExists(this.timers.get(agentContext.entityId))
    entityTimers.delete(key)
  }

  hasTimer(agentContext: AgentContext, key: TTimerKey): boolean {
    const entityTimers = assertExists(this.timers.get(agentContext.entityId))
    return entityTimers.has(key)
  }
}
