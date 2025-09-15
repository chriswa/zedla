import { Vec2, vec2 } from '@/math/vec2'

export class Camera {
  public offset: Vec2 = vec2.create(0, 0)
  public previousOffset: Vec2 = vec2.create(0, 0)
  public zoom = 3
  constructor(
  ) {
  }
}
