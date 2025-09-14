import type { EntityId } from "./ecs/ecs"
import type { RoomDef } from "@/types/roomDef"
import type { Grid2D } from "@/util/grid2D"

import { Camera } from "@/gfx/camera"
import { assertExists } from "@/util/assertExists"

export class RoomContext {
  private _playerEntityId: EntityId | undefined
  public roomDef!: RoomDef
  public physicsGrid!: Grid2D
  public backgroundGrids!: Array<Grid2D>
  public camera = new Camera()

  get playerEntityId(): EntityId {
    return assertExists(this._playerEntityId)
  }

  set playerEntityId(entityId: EntityId) {
    this._playerEntityId = entityId
  }
}