import { EntityId, SceneId } from '@/game/ecs/ecs'
import { Camera } from '@/gfx/camera'
import { RoomDef } from '@/types/roomDef'
import { assertExists } from '@/util/assertExists'
import { Grid2D } from '@/util/grid2D'

export class RoomContext {
  private _playerEntityId: EntityId | undefined
  public readonly sceneId: SceneId
  public roomDef!: RoomDef
  public physicsGrid!: Grid2D
  public backgroundGrids!: Array<Grid2D>
  public camera = new Camera()

  constructor(sceneId: SceneId) {
    this.sceneId = sceneId
  }

  get playerEntityId(): EntityId {
    return assertExists(this._playerEntityId)
  }

  set playerEntityId(entityId: EntityId) {
    this._playerEntityId = entityId
  }
}
