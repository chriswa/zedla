import { GameEventBus } from "../event/gameEventBus"
import type { Brand } from "@/util/type/brand"
import { assertExists } from "@/util/assertExists"
import { assert } from "@/util/assert"
import { componentRegistry } from "./components"
import { singleton } from "tsyringe"

export type EntityId = Brand<number, 'EntityId'>

export type EntityComponentMap = {
  [K in keyof typeof componentRegistry]?: InstanceType<typeof componentRegistry[K]>
}

@singleton()
export class ECS {
  constructor(
    private gameEventBus: GameEventBus,
  ) {
  }

  private nextEntityId = 0 as EntityId;
  private _entities = new Map<EntityId, EntityComponentMap>();

  get entities() {
    return this._entities as ReadonlyMap<EntityId, EntityComponentMap>
  }

  createEntity(): EntityId {
    const entityId = this.nextEntityId++ as EntityId;
    this._entities.set(entityId, {});
    this.gameEventBus.emit('ecs:entity_added', entityId)
    return entityId;
  }

  addComponent<K extends keyof typeof componentRegistry>(
    entityId: EntityId,
    componentKey: K,
    component: EntityComponentMap[K],
  ) {
    const entity = assertExists(this._entities.get(entityId))
    assert(entity[componentKey] === undefined)
    entity[componentKey] = component
    this.gameEventBus.emit('ecs:component_added', entityId, componentKey)
  }

  getComponent<K extends keyof typeof componentRegistry>(
    entityId: EntityId,
    componentKey: K,
  ): EntityComponentMap[K] | undefined {
    return this._entities.get(entityId)?.[componentKey]
  }

  removeComponent<K extends keyof typeof componentRegistry>(
    entityId: EntityId,
    componentKey: K,
  ): void {
    const entity = assertExists(this._entities.get(entityId))
    const component = assertExists(entity[componentKey])
    this.gameEventBus.emit('ecs:component_removing', entityId, componentKey, component)
    delete entity[componentKey]
  }

  destroyEntity(entityId: EntityId): void {
    const entity = assertExists(this._entities.get(entityId))
    const componentKeys = Object.keys(entity) as Array<keyof typeof componentRegistry> // n.b. cast required because Object.keys typing doesn't respect Record<>
    componentKeys.forEach(componentKey => {
      this.removeComponent(entityId, componentKey)
    })
    this.gameEventBus.emit('ecs:entity_removed', entityId)
    this._entities.delete(entityId)
  }
}
