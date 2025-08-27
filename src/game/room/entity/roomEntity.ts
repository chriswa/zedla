import { AnimatedSprite } from "@/gfx/animatedSprite"
import { rect, type Rect } from "@/math/rect"
import { vec3, type Vec3 } from "@/math/vec3"

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
}

// ===

class SampleRoomEntity extends RoomEntity {

  private animatedSprite = new AnimatedSprite('hammer-thrower', 'default')

  constructor(
    protected offset: Vec3,
  ) {
    const moveBox = rect.createCentred(0, -16, 8, 16)
    super(offset, moveBox)
  }
  override tick() {
    super.tick()
    this.animatedSprite.startAnimation(Math.random() < 0.2 ? 'default' : 'throw')
    vec3.setVec3(this.animatedSprite.offset, this.offset)
  }
}
