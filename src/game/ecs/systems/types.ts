import type { RoomContext } from "../../roomContext"

export interface ITickingSystem {
  tick(roomContext: RoomContext): void
}
