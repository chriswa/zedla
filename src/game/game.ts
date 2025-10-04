import { GameContext } from '@/game/gameContext'
import { GameFsmStrategy } from '@/game/gameFsmStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomSimulationStrategy } from '@/game/room/roomSimulationStrategy'
import { Fsm } from '@/util/fsm'
import { container } from 'tsyringe'

export class Game {
  public fsm: Fsm<GameFsmStrategy>

  constructor(private gameContext: GameContext) {
    const roomSimulation = container.resolve(RoomSimulation)
    const initialStrategy = new RoomSimulationStrategy(roomSimulation)
    this.fsm = new Fsm(initialStrategy)
  }

  tick() {
    this.gameContext.currentTick += 1
    this.fsm.process(this.gameContext)
  }

  render(renderBlend: number) {
    this.fsm.active.render(this.gameContext, renderBlend)
  }
}
