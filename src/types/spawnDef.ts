import type { AgentKindKey, AgentSpawnData } from "@/game/agent/agentKindRegistry";
import type { Vec2 } from "@/math/vec2";

export type RoomEntityDef = {
  [K in AgentKindKey]: {
    kind: K
    position: Vec2
    spawnData: AgentSpawnData[K]
  }
}[AgentKindKey]
