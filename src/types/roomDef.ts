import type { TilesetDef } from "./tilesetDef";

export interface PhysicsTilemapDef {
  tileSize: number
  cols: number
  tiles: Uint16Array
}

export interface BackgroundTilemapDef {
  tileset: TilesetDef
  cols: number
  tiles: Uint16Array
}

export interface RoomDef {
  physicsTilemap: PhysicsTilemapDef
  backgroundTilemaps: Array<BackgroundTilemapDef>
  spawns: Array<{
    kind: string // TODO: typing based on resources/entities (maybe ts-intern?)
    x: number
    y: number
  }>
}
