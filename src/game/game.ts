import { singleton } from "tsyringe"
import { GameStrategy } from "./gameStrategy"
import { FSM } from "@/util/fsm"
import { RoomGameStrategy } from "./room/roomGameStrategy"
import { Renderer } from "@/gfx/renderer"
import { rooms } from "@/resources/rooms"

@singleton()
export class Game {

  public fsm = new FSM<GameStrategy>()

  constructor(
    public renderer: Renderer,
  ) {
  }

  start() {
    this.fsm.queued = new RoomGameStrategy(this, rooms.intro1)
  }

  tick() {
    this.fsm.processQueuedState()
    this.fsm.active?.tick()
  }
}
