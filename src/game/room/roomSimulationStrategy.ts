import { GameContext } from '@/game/gameContext'
import { GameFsmStrategy } from '@/game/gameFsmStrategy'
import { RoomSimulation } from '@/game/room/roomSimulation'
import { RoomContext } from '@/game/roomContext'
import { roomDefs } from '@/resources/roomDefs'
import { assertExists } from '@/util/assertExists'

export class RoomSimulationStrategy extends GameFsmStrategy {
  private _roomContext: RoomContext | undefined

  private get roomContext(): RoomContext {
    return assertExists(this._roomContext, 'RoomContext not initialized - onEnter not called')
  }

  constructor(
    private roomSimulation: RoomSimulation,
  ) {
    super()
  }

  override onEnter(gameContext: GameContext): void {
    const roomDefKey = assertExists(gameContext.currentRoomDefKey, 'gameContext.currentRoomDefKey is undefined when entering RoomSimulationStrategy')
    const roomDef = roomDefs[roomDefKey]
    this._roomContext = this.roomSimulation.initializeRoomContext(roomDef, gameContext)
  }

  update(_gameContext: GameContext): GameFsmStrategy | undefined {
    this.roomSimulation.tick(this.roomContext)
    return undefined
  }

  render(_gameContext: GameContext, renderBlend: number): void {
    this.roomSimulation.render(renderBlend, this.roomContext)
  }
}
