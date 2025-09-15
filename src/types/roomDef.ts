import { RoomEntityDef } from '@/types/spawnDef'
import { TilesetDef } from '@/types/tilesetDef'

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
