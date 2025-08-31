import { singleton } from "tsyringe"
import { GameStrategy } from "./gameStrategy"
import { FSM } from "@/util/fsm"
import { RoomGameStrategy } from "./room/roomGameStrategy"
import { roomDefs } from "@/resources/roomDefs"

class NoOpGameStrategy extends GameStrategy {}

@singleton()
export class Game {

  public fsm = new FSM<GameStrategy>(new NoOpGameStrategy())

  constructor(
    // public input: Input,
  ) {
  }

  boot() {
    this.fsm.queueStateFactory(() => new RoomGameStrategy(roomDefs.intro1))
  }

  tick() {
    this.fsm.processQueuedState()
    this.fsm.active.tick()
  }
  render() {
    this.fsm.active.render()
  }
}
