import { EntityId, SceneId } from '@/game/ecs/ecs'
import { GameContext } from '@/game/gameContext'
import { Camera } from '@/gfx/camera'
import { RoomDef } from '@/types/roomDef'
import { assertExists } from '@/util/assertExists'
import { Grid2D } from '@/util/grid2D'

export class RoomContext {
  private _playerEntityId: EntityId | undefined
  public physicsGrid!: Grid2D
  public backgroundGrids!: Array<Grid2D>
  public camera = new Camera()

  constructor(
    public readonly sceneId: SceneId,
    public readonly roomDef: RoomDef,
    public readonly gameContext: GameContext,
  ) {
    this.physicsGrid = new Grid2D(roomDef.physicsTilemap.tiles, roomDef.physicsTilemap.cols)
    this.backgroundGrids = roomDef.backgroundTilemaps.map((bg) => new Grid2D(bg.tiles, bg.cols))
  }

  get playerEntityId(): EntityId {
    return assertExists(this._playerEntityId)
  }

  setPlayerEntityId(entityId: EntityId) {
    this._playerEntityId = entityId
  }
}
