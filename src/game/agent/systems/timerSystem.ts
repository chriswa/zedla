import { AgentContext } from '@/game/agent/agentContext'
import { assertExists } from '@/util/assertExists'
import { Brand } from '@/util/type/brand'
import { KeysOfType } from '@/util/type/keysOfType'
import { singleton } from 'tsyringe'

export type Tickstamp = Brand<number, 'Tickstamp'>

@singleton()
export class TimerSystem {
  setTimer<TData, K extends KeysOfType<TData, Tickstamp | undefined>>(
    agentContext: AgentContext,
    entityData: TData,
    key: K,
  ): void {
    (entityData[key] as Tickstamp | undefined) = agentContext.roomContext.gameContext.currentTick as Tickstamp
  }

  maybeGetElapsedTicks<TData, K extends KeysOfType<TData, Tickstamp | undefined>>(
    agentContext: AgentContext,
    entityData: TData,
    key: K,
  ): number | undefined {
    const startTick = entityData[key] as Tickstamp | undefined
    if (startTick === undefined) { return undefined }
    return agentContext.roomContext.gameContext.currentTick - startTick
  }

  getElapsedTicks<TData, K extends KeysOfType<TData, Tickstamp | undefined>>(
    agentContext: AgentContext,
    entityData: TData,
    key: K,
  ): number {
    return assertExists(this.maybeGetElapsedTicks(agentContext, entityData, key))
  }

  clearTimer<TData, K extends KeysOfType<TData, Tickstamp | undefined>>(
    entityData: TData,
    key: K,
  ): void {
    (entityData[key] as Tickstamp | undefined) = undefined
  }

  hasTimer<TData, K extends KeysOfType<TData, Tickstamp | undefined>>(
    entityData: TData,
    key: K,
  ): boolean {
    return (entityData[key] as Tickstamp | undefined) !== undefined
  }
}
