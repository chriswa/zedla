import { AgentKindKey, AgentSpawnData } from '@/game/agent/agentKindResolver'
import { Vec2 } from '@/math/vec2'

export type RoomEntityDef = {
  [K in AgentKindKey]: {
    kind: K
    position: Vec2
    spawnData: AgentSpawnData[K]
  }
}[AgentKindKey]
