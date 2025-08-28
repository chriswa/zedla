import { type Rect } from "@/math/rect"
import { type Vec3 } from "@/math/vec3"

export abstract class RoomEntity {
  public age = 0
  constructor(
    protected offset: Vec3,
    protected moveBox: Rect,
  ) {
  }
  tick() {
    this.age += 1
  }
  destroy() {
  }
}
