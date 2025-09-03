import { vec3, type Vec3 } from "@/math/vec3";
import { Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class Camera {
  public offset: Vec3 = vec3.create(0, 0, 0)
  public previousOffset: Vec3 = vec3.create(0, 0, 0)
  public zoom = 3
  constructor(
  ) {
  }
}