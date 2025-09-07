import type { spriteFrameDefs } from "@/resources/spriteFrameDefs"

export interface AnimationFrameDef {
  spriteFrame: keyof typeof spriteFrameDefs
  duration: number
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
