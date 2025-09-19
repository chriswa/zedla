import { GameContext } from '@/game/gameContext'
import { GameFsmStrategy } from '@/game/gameFsmStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomSimulationStrategy } from '@/game/room/roomSimulationStrategy'
import { roomDefs } from '@/resources/roomDefs'
import { Fsm } from '@/util/fsm'
import { container } from 'tsyringe'

export class Game {
  public static roomSimulation = container.resolve(RoomSimulation)

  public fsm: Fsm<GameFsmStrategy, GameContext>

  constructor(private gameContext: GameContext) {
    const roomDef = roomDefs.intro1
    const roomContext = Game.roomSimulation.initializeRoomContext(roomDef)
    const initialStrategy = new RoomSimulationStrategy(Game.roomSimulation, roomContext)
    this.fsm = new Fsm(initialStrategy)
  }

  tick() {
    this.fsm.process(this.gameContext)
  }

  render(renderBlend: number) {
    this.fsm.active.render(this.gameContext, renderBlend)
  }
}
