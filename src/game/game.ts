import { container, singleton } from "tsyringe"

import { GameStrategy } from "./gameStrategy"
import { RoomSimulation } from "./room/roomSimulation"

import { roomDefs } from "@/resources/roomDefs"
import { RoomDefToken, type RoomDef } from "@/types/roomDef"
import { FSM } from "@/util/fsm"


class NoOpGameStrategy extends GameStrategy {}

@singleton()
export class Game {

  public fsm = new FSM<GameStrategy>(new NoOpGameStrategy())

  constructor(
    // public input: Input,
  ) {
  }

  boot() {
    this.fsm.queueStateFactory(() => {
      // return new RoomGameStrategy(roomDefs.intro1)
      const roomDef = roomDefs.intro1
      const childContainer = container.createChildContainer()
      childContainer.registerInstance<RoomDef>(RoomDefToken, roomDef)
      return childContainer.resolve(RoomSimulation)
    })
  }

  tick() {
    this.fsm.processQueuedState()
    this.fsm.active.tick()
  }
  render(renderBlend: number) {
    this.fsm.active.render(renderBlend)
  }
}
