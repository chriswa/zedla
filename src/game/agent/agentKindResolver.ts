import { FooAgentKind } from '@/game/agent/kinds/fooAgentKind'
import { PlayerAgentKind } from '@/game/agent/kinds/player/playerAgentKind'
import { EntityId } from '@/game/ecs/ecs'
import { ClassMapResolver } from '@/util/classMapResolver'
import { singleton } from 'tsyringe'

// Simple class map - no eager resolution
const agentKindClassMap = {
  Foo: FooAgentKind,
  Player: PlayerAgentKind,
} as const

export type AgentKindKey = keyof typeof agentKindClassMap

// Mapped type to extract spawn data from class map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractSpawnDataFromClassMap<TClassMap extends Record<string, new(...args: Array<any>) => any>> = {
  [K in keyof TClassMap]: InstanceType<TClassMap[K]> extends {
    spawn(entityId: EntityId, spawnData: infer TSpawnData): void
  } ? TSpawnData : never
}

export type AgentSpawnData = ExtractSpawnDataFromClassMap<typeof agentKindClassMap>

@singleton()
export class AgentKindResolver extends ClassMapResolver<typeof agentKindClassMap> {
  constructor() {
    super(agentKindClassMap)
  }

  /**
   * Spawn an agent of the specified kind with the given data.
   */
  spawnAgent<K extends AgentKindKey>(
    entityId: EntityId,
    kind: K,
    spawnData: AgentSpawnData[K],
  ): void {
    const agentKind = this.resolve(kind)
    // Type assertion needed because TS loses the connection between K and the specific spawn data type
    ;(agentKind.spawn as (entityId: EntityId, spawnData: AgentSpawnData[K]) => void)(entityId, spawnData)
  }
}
