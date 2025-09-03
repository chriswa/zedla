import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { assertExists } from "@/util/assertExists";
import { RoomContext } from "@/game/roomContext";

@scoped(Lifecycle.ContainerScoped)
export class PlayerSystem implements ISystem, Disposable {
  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
  ) {
  }
  tick() {
    const playerEntityId = this.roomContext.playerEntityId
    const playerComponents = assertExists(this.ecs.entities.get(playerEntityId))
  }
  dispose() {
  }
}
