import { IAgentKind } from '@/game/agent/agentKind'
import { FacingComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
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
export class BarAgentKind implements IAgentKind<BarSpawnData> {
  constructor(
    private ecs: ECS,
  ) {}

  private npcData = new Map<EntityId, BarNpcData>()

  spawn(entityId: EntityId, spawnData: BarSpawnData): void {
    this.npcData.set(entityId, {
      name: spawnData.name,
      patrolDistance: spawnData.patrolDistance,
    })
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
  }

  tick(_entityId: EntityId, _components: EntityComponentMap, _roomContext: RoomContext): void {
    // Example: consume and clear mailbox (no reaction yet)
    const mailbox = _components.MailboxComponent
    if (mailbox) mailbox.eventQueue.length = 0
  }

  onDestroy(entityId: EntityId): void {
    this.npcData.delete(entityId)
  }
}
