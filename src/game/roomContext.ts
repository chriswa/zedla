import { Lifecycle, scoped } from "tsyringe"
import { assertExists } from "@/util/assertExists"
import type { EntityId } from "./ecs/ecs"

@scoped(Lifecycle.ContainerScoped)
export class RoomContext {
  private _playerEntityId: EntityId | undefined

  get playerEntityId(): EntityId {
    return assertExists(this._playerEntityId)
  }

  set playerEntityId(entityId: EntityId) {
    this._playerEntityId = entityId
  }
}