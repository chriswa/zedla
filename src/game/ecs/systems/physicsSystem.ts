import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";

@scoped(Lifecycle.ContainerScoped)
export class PhysicsSystem implements ISystem, Disposable {
  constructor(
  ) {
  }
  tick() {
  }
  dispose() {
  }
}
