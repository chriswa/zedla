import type { imageSliceDefs } from "@/resources/imageSliceDefs"

export interface AnimationFrameDef {
  frame: keyof typeof imageSliceDefs
  duration: number
}

export interface AnimationDef {
  loop: boolean
  frames: Array<AnimationFrameDef>
}
