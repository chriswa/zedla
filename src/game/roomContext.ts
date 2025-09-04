import { Lifecycle, scoped } from "tsyringe"
import { assertExists } from "@/util/assertExists"
import type { EntityId } from "./ecs/ecs"
import type { RoomDef } from "@/types/roomDef"
import { Grid2D } from "@/util/grid2D"

@scoped(Lifecycle.ContainerScoped)
export class RoomContext {
  private _playerEntityId: EntityId | undefined
  public roomDef!: RoomDef
  public physicsGrid!: Grid2D
  public backgroundGrids!: Grid2D[]

  get playerEntityId(): EntityId {
    return assertExists(this._playerEntityId)
  }

  set playerEntityId(entityId: EntityId) {
    this._playerEntityId = entityId
  }
}