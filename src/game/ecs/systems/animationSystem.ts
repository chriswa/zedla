import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";

@scoped(Lifecycle.ContainerScoped)
export class AnimationSystem implements ISystem, Disposable {
  constructor(
  ) {
  }
  dispose() {
  }
}
