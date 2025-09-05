import type { ComponentKey, componentRegistry } from "@/game/ecs/components";
import type { EntityId } from "@/game/ecs/ecs";

type ComponentInstance<K extends ComponentKey> = InstanceType<typeof componentRegistry[K]>

export const ecsEventSchema = {
  "ecs:entity_added": (_entityId: EntityId): void => {},
  "ecs:entity_removed": (_entityId: EntityId): void => {},
  "ecs:component_added": (_entityId: EntityId, _componentKey: ComponentKey): void => {},
  "ecs:component_removing": <K extends ComponentKey>(_entityId: EntityId, _componentKey: K, _component: ComponentInstance<K>): void => {},
} as const
