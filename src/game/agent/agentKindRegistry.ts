import { BarAgentKind } from '@/game/agent/kinds/barAgentKind'
import { FooAgentKind } from '@/game/agent/kinds/fooAgentKind'
import { PlayerAgentKind } from '@/game/agent/kinds/player/playerAgentKind'
import { EntityId } from '@/game/ecs/ecs'
import { resolveFromClassMap } from '@/util/resolveFromClassMap'

// Simple class map - no eager resolution
const agentKindClassMap = {
  Foo: FooAgentKind,
  Bar: BarAgentKind,
  Player: PlayerAgentKind,
} as const

export type AgentKindKey = keyof typeof agentKindClassMap

// Mapped type to extract spawn data from class map
type ExtractSpawnDataFromClassMap<TClassMap extends Record<string, new(...args: any[]) => any>> = {
  [K in keyof TClassMap]: InstanceType<TClassMap[K]> extends {
    spawn(entityId: EntityId, spawnData: infer TSpawnData): void
  } ? TSpawnData : never
}

export type AgentSpawnData = ExtractSpawnDataFromClassMap<typeof agentKindClassMap>

export function resolveAgentKind<K extends AgentKindKey>(kind: K): InstanceType<typeof agentKindClassMap[K]> {
  return resolveFromClassMap(agentKindClassMap, kind) as InstanceType<typeof agentKindClassMap[K]>
}

export function spawnAgentByKind<K extends AgentKindKey>(
  entityId: EntityId,
  kind: K,
  spawnData: AgentSpawnData[K],
): void {
  const agentKind = resolveAgentKind(kind)
  // Type assertion needed because TS loses the connection between K and the specific spawn data type
  ;(agentKind.spawn as (entityId: EntityId, spawnData: AgentSpawnData[K]) => void)(entityId, spawnData)
}
