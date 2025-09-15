import { GameStrategy } from '@/game/gameStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomSimulationStrategy } from '@/game/room/roomSimulationStrategy'
import { roomDefs } from '@/resources/roomDefs'
import { FSM } from '@/util/fsm'
import { singleton } from 'tsyringe'

class NoOpGameStrategy extends GameStrategy {}

@singleton()
export class Game {
  public fsm = new FSM<GameStrategy>(new NoOpGameStrategy())

  constructor(
    private roomSimulation: RoomSimulation,
  ) {
  }

  boot() {
    this.fsm.queueStrategyFactory(() => {
      const roomDef = roomDefs.intro1
      const roomContext = this.roomSimulation.createRoomContext(roomDef)
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
