import { singleton } from "tsyringe"
import { GameStrategy } from "./gameStrategy"
import { FSM } from "@/util/fsm"
import { RoomGameStrategy } from "./room/roomGameStrategy"
import { Renderer } from "@/gfx/renderer"
import { roomDefs } from "@/resources/roomDefs"
import { Input } from "@/app/input"

@singleton()
export class Game {

  public fsm = new FSM<GameStrategy>()

  constructor(
    public renderer: Renderer,
    public input: Input,
  ) {
  }

  start() {
    this.fsm.queued = new RoomGameStrategy(this, roomDefs.intro1)
  }

  tick() {
    this.fsm.processQueuedState()
    this.fsm.active?.tick()
  }
}
