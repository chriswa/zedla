import { RoomContext } from '@/game/roomContext'

export interface ITickingSystem {
  tick(roomContext: RoomContext): void
}
