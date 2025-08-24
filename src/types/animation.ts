import type { frames } from "@/resources/frames"

export interface AnimationFrame {
  frame: keyof typeof frames
  duration: number
}

export interface Animation {
  loop: boolean
  frames: Array<AnimationFrame>
}
