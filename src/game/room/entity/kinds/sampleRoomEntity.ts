import { AnimatedSprite } from "@/gfx/animatedSprite"
import { RoomEntity } from "../roomEntity"
import type { Game } from "@/game/game"
import { vec3, type Vec3 } from "@/math/vec3"
import { rect } from "@/math/rect"

export class SampleRoomEntity extends RoomEntity {

  private animatedSprite = new AnimatedSprite('hammer-thrower', 'default')

  constructor(
    protected game: Game,
    protected offset: Vec3,
    foo: number,
    bar: string,
  ) {
    const moveBox = rect.createCentred(0, -16, 8, 16)
    super(offset, moveBox)
    game.renderer.add(this.animatedSprite)
  }
  override tick() {
    super.tick()
    this.animatedSprite.startAnimation(Math.random() < 0.2 ? 'default' : 'throw')
    vec3.setVec3(this.animatedSprite.offset, this.offset)
  }
  override destroy() {
    this.game.renderer.remove(this.animatedSprite)
  }
}