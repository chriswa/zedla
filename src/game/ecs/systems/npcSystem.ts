import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { RoomContext } from "@/game/roomContext";

@scoped(Lifecycle.ContainerScoped)
export class NpcSystem implements ISystem, Disposable {
  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
  ) {
  }
  tick() {
    this.ecs.entities.forEach((components, _entityId) => {
      // const npcComponent = components.NpcComponent
      // if (npcComponent !== undefined) {
      // }
    })
  }
  dispose() {
  }
}
