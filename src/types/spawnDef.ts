import type { NpcKindKey, NpcSpawnData } from "@/game/npc/npcKindRegistry";
import type { Vec2 } from "@/math/vec2";

export type RoomEntityDef = {
  [K in NpcKindKey]: {
    kind: K
    position: Vec2
    spawnData: NpcSpawnData[K]
  }
}[NpcKindKey]
