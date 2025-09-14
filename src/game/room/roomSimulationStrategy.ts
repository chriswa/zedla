import { GameStrategy } from "../gameStrategy";

import type { RoomContext } from "../roomContext";
import type { RoomSimulation } from "./roomSimulation";

export class RoomSimulationStrategy extends GameStrategy {
  constructor(
    private roomSimulation: RoomSimulation,
    private roomContext: RoomContext,
  ) {
    super()
  }

  tick() {
    this.roomSimulation.tick(this.roomContext)
  }

  render(renderBlend: number) {
    this.roomSimulation.render(renderBlend, this.roomContext)
  }
}