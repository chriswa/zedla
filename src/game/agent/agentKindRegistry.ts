import { container } from 'tsyringe'

import type { EntityId } from '../ecs/ecs'

import { BarAgentKind } from './kinds/barAgentKind'
import { FooAgentKind } from './kinds/fooAgentKind'
import { PlayerAgentKind } from './kinds/playerAgentKind'

export const agentKindRegistry = {
  Foo: container.resolve(FooAgentKind),
  Bar: container.resolve(BarAgentKind),
  Player: container.resolve(PlayerAgentKind),
} as const

export type AgentKindKey = keyof typeof agentKindRegistry

export type AgentSpawnData = {
  [K in keyof typeof agentKindRegistry]:
    typeof agentKindRegistry[K] extends { spawn(entityId: EntityId, spawnData: infer TSpawnData): void }
      ? TSpawnData
      : never
}

export function spawnAgentByKind<K extends AgentKindKey>(
  entityId: EntityId,
  kind: K,
  spawnData: AgentSpawnData[K],
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  (agentKindRegistry[kind].spawn as any)(entityId, spawnData)
}
