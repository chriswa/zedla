import { singleton } from "tsyringe"
import { GameStrategy } from "./gameStrategies/gameStrategy"
import { FSM } from "@/util/fsm"
import { RoomGameStrategy } from "./gameStrategies/roomGameStrategy"
import { Renderer } from "@/gfx/renderer"

@singleton()
export class Game {
  public fsm = new FSM<GameStrategy>()
  constructor(
    public renderer: Renderer,
  ) {
  }
  start() {
    this.fsm.queued = new RoomGameStrategy(this)
  }
  update() {
    this.fsm.processQueuedState()
    this.fsm.active?.update()
  }
}
