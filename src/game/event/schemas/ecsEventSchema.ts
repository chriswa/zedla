import type { ComponentKey } from "@/game/ecs/components";
import type { EntityId } from "@/game/ecs/ecs";

export const ecsEventSchema = {
  "ecs:entity_added": (entityId: EntityId): void => {},
  "ecs:entity_removed": (entityId: EntityId): void => {},
  "ecs:component_added": (entityId: EntityId, componentKey: ComponentKey): void => {},
  "ecs:component_removed": (entityId: EntityId, componentKey: ComponentKey): void => {},
} as const
