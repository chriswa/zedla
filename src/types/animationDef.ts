import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { AnimationFrameBits } from '@/types/animationFlags'

export interface AnimationFrameDef {
  spriteFrame: keyof typeof spriteFrameDefs
  duration: number
  flags?: AnimationFrameBits
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
