import { vec3, type Vec3 } from "@/math/vec3";
import { singleton } from "tsyringe";

@singleton()
export class Camera {
  public offset: Vec3 = vec3.create(0, 0, 0)
  public zoom = 3
  constructor(
  ) {
  }
}