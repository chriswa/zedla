import type { AnimationFrameBits } from "./animationFlags"
import type { spriteFrameDefs } from "@/resources/spriteFrameDefs"

export interface AnimationFrameDef {
  spriteFrame: keyof typeof spriteFrameDefs
  duration: number
  flags?: AnimationFrameBits
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
