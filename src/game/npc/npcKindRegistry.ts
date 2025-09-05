import { container } from "tsyringe";
import { FooNpcKind } from "./fooNpcKind";
import { BarNpcKind } from "./barNpcKind";
import { type EntityId } from "../ecs/ecs";

export const npcKindRegistry = {
  Foo: container.resolve(FooNpcKind),
  Bar: container.resolve(BarNpcKind),
} as const

export type NpcKindKey = keyof typeof npcKindRegistry

export type NpcSpawnData = {
  [K in keyof typeof npcKindRegistry]: 
    typeof npcKindRegistry[K] extends { spawn(entityId: any, spawnData: infer TSpawnData): void } 
      ? TSpawnData 
      : never
}

/**
 * Type-safe NPC spawn dispatcher
 * 
 * The `any` cast here is safe because:
 * 1. The function signature enforces `spawnData: NpcSpawnData[K]` 
 * 2. NpcSpawnData[K] is extracted directly from the spawn method signature
 * 3. The discriminated union in RoomEntityDef guarantees kind/spawnData correlation
 * 4. This is the minimal escape hatch for TypeScript's generic correlation limitation
 */
export function spawnNpcByKind<K extends NpcKindKey>(
  entityId: EntityId,
  kind: K,
  spawnData: NpcSpawnData[K]
): void {
  (npcKindRegistry[kind].spawn as any)(entityId, spawnData) // TODO: is a more type-elegant solution possible
}
