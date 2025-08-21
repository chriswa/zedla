import type { FrameDef } from "@/types/FrameDef"

export const frames = {
  link_walk_1: { src: 'link.png', x: 0, y: 0, w: 16, h: 32 },
  link_walk_2: { src: 'link.png', x: 16, y: 0, w: 16, h: 32 },
} as const satisfies Record<string, FrameDef>

// export type FrameKeys = keyof typeof frames
