import { singleton } from "tsyringe"

import { GameEventBus } from "../event/gameEventBus"

import { componentRegistry } from "./components"

import type { Brand } from "@/util/type/brand"

import { assert } from "@/util/assert"
import { assertExists } from "@/util/assertExists"

export type EntityId = Brand<number, 'EntityId'>
export type ShardId = Brand<number, 'ShardId'>

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
  private nextShardId = 0 as ShardId

  // Dual-map structure
  private globalEntities = new Map<EntityId, EntityComponentMap>()  // Global lookup
  private shards = new Map<ShardId, Set<EntityId>>()                // Shard -> EntityIds

  // Legacy getter for backward compatibility during transition
  get entities() {
    return this.globalEntities as ReadonlyMap<EntityId, EntityComponentMap>
  }

  // Public method for RoomContext to get unique shard
  allocateShardId(): ShardId {
    return this.nextShardId++ as ShardId
  }

  // Methods that require ShardId (entity lifecycle)
  createEntity(shardId: ShardId): EntityId {
    const entityId = this.nextEntityId++ as EntityId

    // Update both maps
    this.globalEntities.set(entityId, {})
    this.getOrCreateShard(shardId).add(entityId)

    this.gameEventBus.emit('ecs:entity_added', entityId)
    return entityId
  }

  // Shard-specific iteration (requires ShardId)
  getEntitiesInShard(shardId: ShardId): ReadonlyMap<EntityId, EntityComponentMap> {
    const shardEntityIds = this.shards.get(shardId) ?? new Set<EntityId>()
    const result = new Map<EntityId, EntityComponentMap>()

    for (const entityId of shardEntityIds) {
      const components = this.globalEntities.get(entityId)
      if (components) {
        result.set(entityId, components)
      }
    }

    return result as ReadonlyMap<EntityId, EntityComponentMap>
  }

  // Global operations (no ShardId needed - EntityId is globally unique)
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
    for (const shardEntities of this.shards.values()) {
      shardEntities.delete(entityId) // Safe to call on all shards
    }

    this.gameEventBus.emit('ecs:entity_removed', entityId)
  }

  private getOrCreateShard(shardId: ShardId): Set<EntityId> {
    if (!this.shards.has(shardId)) {
      this.shards.set(shardId, new Set())
    }
    return this.shards.get(shardId)!
  }
}
