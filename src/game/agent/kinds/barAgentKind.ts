import { IAgentKind } from '@/game/agent/agentKind'
import { FacingComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
import { RoomContext } from '@/game/roomContext'
import { Facing } from '@/types/facing'
import { singleton } from 'tsyringe'

interface BarNpcData {
  name: string
  patrolDistance: number
}

interface BarSpawnData {
  name: string
  patrolDistance: number
}

@singleton()
class BarEntityDataManager extends EntityDataManager<BarNpcData> {}

@singleton()
export class BarAgentKind implements IAgentKind<BarSpawnData> {
  constructor(
    private ecs: ECS,
    private barEntityDataManager: BarEntityDataManager,
  ) {}

  spawn(entityId: EntityId, spawnData: BarSpawnData): void {
    this.barEntityDataManager.onCreate(entityId, {
      name: spawnData.name,
      patrolDistance: spawnData.patrolDistance,
    })
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
  }

  tick(_entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
    // Example: consume and clear mailbox (no reaction yet)
    const mailbox = _components.MailboxComponent
    if (mailbox) { mailbox.eventQueue.length = 0 }
  }

  onDestroy(entityId: EntityId): void {
    this.barEntityDataManager.onDestroy(entityId)
  }
}
