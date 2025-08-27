import type { TilesetDef } from "@/types/tilesetDef"

export const tilesetDefs = {
  tiles3: {
    src: 'tiles3.png',
    tileWidth: 16,
    tileHeight: 16,
    cols: 8,
    rows: 8,
  },
  tiles4: {
    src: 'tiles4.png',
    tileWidth: 16,
    tileHeight: 16,
    cols: 16,
    rows: 16,
  },
} as const satisfies Record<string, TilesetDef>
