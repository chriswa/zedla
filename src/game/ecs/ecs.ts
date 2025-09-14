import { singleton } from "tsyringe"

import { GameEventBus } from "../event/gameEventBus"

import { componentRegistry } from "./components"

import type { Brand } from "@/util/type/brand"

import { assert } from "@/util/assert"
import { assertExists } from "@/util/assertExists"

export type EntityId = Brand<number, 'EntityId'>
export type SceneId = Brand<number, 'SceneId'>

export type EntityComponentMap = {
  [K in keyof typeof componentRegistry]?: InstanceType<typeof componentRegistry[K]>
}

@singleton()
export class ECS {
  constructor(
    private gameEventBus: GameEventBus,
  ) {
  }

  private nextEntityId = 0 as EntityId
  private nextSceneId = 0 as SceneId

  // Dual-map structure
  private globalEntities = new Map<EntityId, EntityComponentMap>()  // Global lookup
  private scenes = new Map<SceneId, Set<EntityId>>()                // Scene -> EntityIds

  // Legacy getter for backward compatibility during transition
  get entities() {
    return this.globalEntities as ReadonlyMap<EntityId, EntityComponentMap>
  }

  // Public method for RoomContext to get unique scene
  allocateSceneId(): SceneId {
    return this.nextSceneId++ as SceneId
  }

  // Methods that require SceneId (entity lifecycle)
  createEntity(sceneId: SceneId): EntityId {
    const entityId = this.nextEntityId++ as EntityId

    // Update both maps
    this.globalEntities.set(entityId, {})
    this.getOrCreateScene(sceneId).add(entityId)

    this.gameEventBus.emit('ecs:entity_added', entityId)
    return entityId
  }

  // Scene-specific iteration (requires SceneId)
  getEntitiesInScene(sceneId: SceneId): ReadonlyMap<EntityId, EntityComponentMap> {
    const sceneEntityIds = this.scenes.get(sceneId) ?? new Set<EntityId>()
    const result = new Map<EntityId, EntityComponentMap>()

    for (const entityId of sceneEntityIds) {
      const components = this.globalEntities.get(entityId)
      if (components) {
        result.set(entityId, components)
      }
    }

    return result as ReadonlyMap<EntityId, EntityComponentMap>
  }

  // Global operations (no SceneId needed - EntityId is globally unique)
  addComponent<K extends keyof typeof componentRegistry>(
    entityId: EntityId,
    componentKey: K,
    component: EntityComponentMap[K],
  ) {
    const entity = assertExists(this.globalEntities.get(entityId))
    assert(entity[componentKey] === undefined)
    entity[componentKey] = component
    this.gameEventBus.emit('ecs:component_added', entityId, componentKey)
  }

  getComponent<K extends keyof typeof componentRegistry>(
    entityId: EntityId,
    componentKey: K,
  ): EntityComponentMap[K] | undefined {
    return this.globalEntities.get(entityId)?.[componentKey]
  }

  removeComponent(
    entityId: EntityId,
    componentKey: keyof typeof componentRegistry,
  ): void {
    const entity = assertExists(this.globalEntities.get(entityId))
    const component = assertExists(entity[componentKey])
    this.gameEventBus.emit('ecs:component_removing', entityId, componentKey, component)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete entity[componentKey]
  }

  destroyEntity(entityId: EntityId): void {
    const entity = assertExists(this.globalEntities.get(entityId))
    const componentKeys = Object.keys(entity) as Array<keyof typeof componentRegistry> // n.b. cast required because Object.keys typing doesn't respect Record<>

    // Remove all components first
    for (const componentKey of componentKeys) {
      this.removeComponent(entityId, componentKey)
    }

    // Remove from both maps
    this.globalEntities.delete(entityId)
    for (const sceneEntities of this.scenes.values()) {
      sceneEntities.delete(entityId) // Safe to call on all scenes
    }

    this.gameEventBus.emit('ecs:entity_removed', entityId)
  }

  private getOrCreateScene(sceneId: SceneId): Set<EntityId> {
    if (!this.scenes.has(sceneId)) {
      this.scenes.set(sceneId, new Set())
    }
    return this.scenes.get(sceneId)!
  }
}
