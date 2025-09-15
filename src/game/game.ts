import { GameFsmStrategy } from '@/game/gameFsmStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomSimulationStrategy } from '@/game/room/roomSimulationStrategy'
import { roomDefs } from '@/resources/roomDefs'
import { Fsm } from '@/util/fsm'
import { singleton } from 'tsyringe'

class NoOpGameFsmStrategy extends GameFsmStrategy {}

@singleton()
export class Game {
  public fsm = new Fsm<GameFsmStrategy>(new NoOpGameFsmStrategy())

  constructor(
    private roomSimulation: RoomSimulation,
  ) {
  }

  boot() {
    this.fsm.queueStrategyFactory(() => {
      const roomDef = roomDefs.intro1
      const roomContext = this.roomSimulation.initializeRoomContext(roomDef)
      return new RoomSimulationStrategy(this.roomSimulation, roomContext)
    })
  }

  tick() {
    this.fsm.processQueuedStrategy()
    this.fsm.active.tick()
  }

  render(renderBlend: number) {
    this.fsm.active.render(renderBlend)
  }
}
