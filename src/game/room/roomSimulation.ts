import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";
import { ECS } from "../ecs/ecs";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import type { AnimationSystem } from "../ecs/systems/animationSystem";

@scoped(Lifecycle.ContainerScoped)
export class RoomSimulation implements Disposable {
  constructor(
    private ecs: ECS,
    @inject(RoomDefToken) private roomDef: RoomDef,
    private animationSystem: AnimationSystem,
  ) {
  }
  tick() {
  }
  dispose() {
  }
}
