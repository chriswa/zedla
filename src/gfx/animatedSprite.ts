import { animationDefs } from "@/resources/animationDefs"
import { Sprite } from "./sprite"
import { vec3, type Vec3 } from "@/math/vec3"
import type { AnimationDef } from "@/types/animationDef"
import { imageSliceDefs } from "@/resources/imageSliceDefs"

type AnimationDefs = typeof animationDefs
export type AnimationDefCharacterKeys = keyof AnimationDefs
export type AnimationDefKeys<TCharacterKey extends AnimationDefCharacterKeys> = keyof AnimationDefs[TCharacterKey]

export class AnimatedSprite<
  TCharacterKey extends AnimationDefCharacterKeys,
> extends Sprite {
  private animation!: AnimationDef
  private frameIndex = 0
  private ticksElapsedThisFrame = 0
  constructor(
    private animationDefCharacterKey: TCharacterKey,
    initialAnimationDefKey: AnimationDefKeys<TCharacterKey>,
  ) {
    const initialAnimation = animationDefs[animationDefCharacterKey][initialAnimationDefKey] as AnimationDef // required because `as const`
    const frameId = initialAnimation.frames[0]!.frame
    const frameDef = imageSliceDefs[frameId]
    super(frameDef)
    this.startAnimation(initialAnimationDefKey)
  }
  public startAnimation(animationId: AnimationDefKeys<TCharacterKey>) {
    this.animation = animationDefs[this.animationDefCharacterKey][animationId] as AnimationDef // required because `as const`
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
      this.frameDef = imageSliceDefs[this.animation.frames[this.frameIndex]!.frame]
    }
  }
}

// const x = new AnimatedSprite(vec3.create(0, 0, 0), 'blob', 'twitch')
// x.startAnimation('jump')
// x.startAnimation('xxx')
// const bad = new AnimatedSprite(vec3.create(0, 0, 0), 'foo', 'bar')
// const bad2 = new AnimatedSprite(vec3.create(0, 0, 0), 'blob', 'waldo')
