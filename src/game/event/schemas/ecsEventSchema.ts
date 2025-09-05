import type { ComponentKey, componentRegistry } from "@/game/ecs/components";
import type { EntityId } from "@/game/ecs/ecs";

type ComponentInstance<K extends ComponentKey> = InstanceType<typeof componentRegistry[K]>

export const ecsEventSchema = {
  "ecs:entity_added": (entityId: EntityId): void => {},
  "ecs:entity_removed": (entityId: EntityId): void => {},
  "ecs:component_added": (entityId: EntityId, componentKey: ComponentKey): void => {},
  "ecs:component_removing": <K extends ComponentKey>(entityId: EntityId, componentKey: K, component: ComponentInstance<K>): void => {},
} as const
