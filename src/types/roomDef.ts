import type { RoomEntityDef } from "./spawnDef";
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
  spawns: Array<RoomEntityDef>
}

export const RoomDefToken = Symbol('RoomDef')
