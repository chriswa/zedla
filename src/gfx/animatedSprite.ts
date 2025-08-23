import { animations } from "@/resources/animations";
import { Sprite } from "./sprite";
import type { Vec3 } from "@/math/vec3";
import type { AnimationDef } from "@/types/AnimationDef";
import { frames } from "@/resources/frames";

type Animations = typeof animations
type Character = keyof Animations
type AnimationName<C extends Character> = keyof Animations[C]

export class AnimatedSprite<
  C extends Character,
  A extends AnimationName<C>
> extends Sprite {
  private animation!: AnimationDef
  private frameIndex = 0
  private ticksElapsedThisFrame = 0
  constructor(
    offset: Vec3,
    private characterId: C,
    initialAnimationId: A,
  ) {
    const initialAnimation = animations[characterId][initialAnimationId] as AnimationDef // required because `as const`
    const frameId = initialAnimation.frames[0]!.frame
    const frameDef = frames[frameId]
    super(offset, frameDef)
    this.setAnimation(initialAnimationId)
  }
  private setAnimation(animationId: A) {
    this.animation = animations[this.characterId][animationId] as AnimationDef // required because `as const`
    this.frameIndex = 0
    this.ticksElapsedThisFrame = 0
  }
  override tick() {
    this.ticksElapsedThisFrame += 1
    if (this.ticksElapsedThisFrame >= this.animation.frames[this.frameIndex]!.duration) {
      this.ticksElapsedThisFrame = 0
      if (this.frameIndex < this.animation.frames.length - 1) {
        this.frameIndex += 1
      }
      else if (this.animation.loop) {
        this.frameIndex = 0
      }
      this.frameDef = frames[this.animation.frames[this.frameIndex]!.frame]
    }
  }
}
