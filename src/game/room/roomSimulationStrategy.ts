import { GameStrategy } from '@/game/gameStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomContext } from '@/game/roomContext'

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
