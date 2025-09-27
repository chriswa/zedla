import { IAgentKind } from './agentKind'
import { AgentLifecycleConsumer } from './agentLifecycleConsumer'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
import { RoomContext } from '@/game/roomContext'
import { ClassMapResolver } from '@/util/classMapResolver'
import { Fsm, FsmStrategy } from '@/util/fsm'
import { Ctor } from '@/util/type/ctor'

interface BaseFsmEntityData {
  fsm: Fsm<FsmStrategy<EntityId, string>>
}

/**
 * Base class for agent kinds that handles common FSM management.
 * Reduces boilerplate by managing the FSM lifecycle, tick processing, and cleanup.
 */
export abstract class BaseAgentKind<
  TSpawnData,
  TClassMap extends Record<string, Ctor<FsmStrategy<EntityId, string>>>,
> implements IAgentKind<TSpawnData> {
  protected fsmStrategyResolver: ClassMapResolver<TClassMap>
  protected baseFsmEntityDataManager: EntityDataManager<BaseFsmEntityData>

  constructor(
    protected ecs: ECS,
    protected strategyClassMap: TClassMap,
    protected initialStrategyKey: keyof TClassMap,
    protected lifecycleEventConsumers: Array<AgentLifecycleConsumer>,
  ) {
    this.fsmStrategyResolver = new ClassMapResolver(strategyClassMap)
    this.baseFsmEntityDataManager = new EntityDataManager<BaseFsmEntityData>()
  }

  spawn(entityId: EntityId, spawnData: TSpawnData): void {
    // Let subclass add its components first
    this.addComponents(entityId, spawnData)

    // Create and initialize FSM
    const fsm = new Fsm<FsmStrategy<EntityId, string>>(
      this.fsmStrategyResolver.resolve(this.initialStrategyKey),
      (key) => this.fsmStrategyResolver.resolve(key),
    )

    for (const agentLifecycleConsumer of this.lifecycleEventConsumers) { agentLifecycleConsumer.afterSpawn(entityId) }

    // Store FSM in base entity data manager
    this.baseFsmEntityDataManager.onCreate(entityId, { fsm })

    // Allow subclass to do post-spawn setup
    this.afterSpawn(entityId, spawnData)
  }

  tick(entityId: EntityId, components: EntityComponentMap, room: RoomContext): void {
    const fsmData = this.baseFsmEntityDataManager.get(entityId)

    // Process FSM
    fsmData.fsm.process(entityId)

    // Allow subclass to do additional tick work
    this.afterTick(entityId, components, room)
  }

  onDestroy(entityId: EntityId): void {
    // Allow subclass to do pre-destroy cleanup
    this.beforeDestroy(entityId)

    for (const agentLifecycleConsumer of this.lifecycleEventConsumers) { agentLifecycleConsumer.beforeDestroy(entityId) }

    // Clean up FSM data
    this.baseFsmEntityDataManager.onDestroy(entityId)
  }

  // Abstract methods for subclasses to implement
  protected abstract addComponents(entityId: EntityId, spawnData: TSpawnData): void

  // Optional hooks with default implementations
  protected afterSpawn(_entityId: EntityId, _spawnData: TSpawnData): void {
    // Override if needed
  }

  protected afterTick(_entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    // Override if needed
  }

  protected beforeDestroy(_entityId: EntityId): void {
    // Override if needed
  }
}
