import type { Tileset } from "./tileset";

export interface TileLayerDef {
  tileset: Tileset,
  cols: number,
  tiles: Array<number>
}

export interface RoomDef {
  layers: Array<TileLayerDef>
}
