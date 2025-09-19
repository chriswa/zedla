import { GameContext } from '@/game/gameContext'
import { GameFsmStrategy } from '@/game/gameFsmStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomContext } from '@/game/roomContext'

export class RoomSimulationStrategy extends GameFsmStrategy {
  constructor(
    private roomSimulation: RoomSimulation,
    private roomContext: RoomContext,
  ) {
    super()
  }

  update(_context: GameContext): GameFsmStrategy | undefined {
    this.roomSimulation.tick(this.roomContext)
    return undefined
  }

  onEnter(_context: GameContext): void {
  }

  onExit(_context: GameContext): void {
  }

  render(_context: GameContext, renderBlend: number): void {
    this.roomSimulation.render(renderBlend, this.roomContext)
  }
}
