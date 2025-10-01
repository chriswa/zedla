import { EntityId } from '@/game/ecs/ecs'
import { RoomContext } from '@/game/roomContext'

export interface AgentContext {
  entityId: EntityId
  roomContext: RoomContext
}
