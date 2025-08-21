import type { TilesetDef } from "@/types/TilesetDef"

export const tilesets = {
  tiles4: {
    src: 'tiles4.png',
    tileWidth: 16,
    tileHeight: 16,
    cols: 16,
    rows: 16,
  },
} as const satisfies Record<string, TilesetDef>

// export type TilesetKeys = keyof typeof tilesets
