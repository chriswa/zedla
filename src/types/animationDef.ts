import type { spriteFrameDefs } from "@/resources/spriteFrameDefs"
import type { AnimationFrameBits } from "./animationFlags"

export interface AnimationFrameDef {
  spriteFrame: keyof typeof spriteFrameDefs
  duration: number
  flags?: AnimationFrameBits
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
