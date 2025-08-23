import type { frames } from "@/resources/frames"

export interface AnimationFrameDef {
  frame: keyof typeof frames
  duration: number
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
