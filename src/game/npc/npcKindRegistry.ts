import { container } from "tsyringe";
import { FooNpcKind } from "./fooNpcKind";
import { BarNpcKind } from "./barNpcKind";
import { type EntityId } from "../ecs/ecs";

export const npcKindRegistry = {
  Foo: container.resolve(FooNpcKind),
  Bar: container.resolve(BarNpcKind),
} as const

export type NpcKindKey = keyof typeof npcKindRegistry

// Extract spawn data types from registry
export type NpcSpawnData = {
  [K in keyof typeof npcKindRegistry]: 
    typeof npcKindRegistry[K] extends { spawn(entityId: any, spawnData: infer TSpawnData): void } 
      ? TSpawnData 
      : never
}

// Type-safe spawn helper
export function spawnNpcByKind<K extends NpcKindKey>(
  entityId: EntityId,
  kind: K,
  spawnData: NpcSpawnData[K]
): void {
  const npcKind = npcKindRegistry[kind]
  ;(npcKind as any).spawn(entityId, spawnData)
}