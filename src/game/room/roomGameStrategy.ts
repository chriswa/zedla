import { container, type DependencyContainer } from "tsyringe";
import { GameStrategy } from "../gameStrategy"
import { RoomDefToken, type RoomDef } from "@/types/roomDef"
import { RoomSimulation } from "./roomSimulation";

export class RoomGameStrategy extends GameStrategy { // a.k.a. RoomOrchestrator
  private roomSimulation: RoomSimulation
  private childContainer: DependencyContainer
  constructor(
    private roomDef: RoomDef,
  ) {
    super()
    this.childContainer = container.createChildContainer()
    this.childContainer.registerInstance<RoomDef>(RoomDefToken, this.roomDef) // or RoomState
    this.roomSimulation = this.childContainer.resolve(RoomSimulation)
  }
  override tick() {
    this.roomSimulation.tick()
  }
  override render() {
    this.roomSimulation.render()
  }
  override dispose() {
    this.childContainer.dispose()
  }
}
