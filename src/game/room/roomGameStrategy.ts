import type { Game } from "../game"
import { GameStrategy } from "../gameStrategy"
import { vec3 } from "@/math/vec3"
import { Tilemap } from "@/gfx/tilemap"
import { AnimatedSprite } from "@/gfx/animatedSprite"
import type { BackgroundTilemapDef, RoomDef } from "@/types/roomDef"
import type { RoomEntity } from "./entity/roomEntity"
import type { Renderer } from "@/gfx/renderer"
import type { RoomEntityInjectedArgs, RoomEntityDef } from "@/types/spawnDef"
import { entityKinds } from "./entity/roomEntityKinds"

// TODO: maybe break RoomRenderer out (as well as RoomSimulation)?

export class RoomGameStrategy extends GameStrategy {

  private gfxTilemaps!: Array<Tilemap>
  private roomEntities = new Set<RoomEntity>() // TODO: maybe not a set?

  constructor(
    private game: Game,
    private renderer: Renderer,
    private roomDef: RoomDef,
  ) {
    super()
    this.gfxTilemaps = createTilemapsFromBackgroundTilemapDefs(this.roomDef.backgroundTilemaps)
    roomDef.spawns.map(roomEntityDef => {
      const roomEntity = spawnRoomEntity(roomEntityDef, game)
      this.roomEntities.add(roomEntity)
    })
  }
  override start() {
    const ani0 = new AnimatedSprite('link', 'walk')
    vec3.setComponents(ani0.offset, 32, 32, 0)
    this.renderer.add(ani0)
    this.gfxTilemaps.forEach(tilemap => {
      this.renderer.add(tilemap)
    })
  }
  override stop() {
    // this.renderer.remove(ani0)
    this.gfxTilemaps.forEach(tilemap => {
      this.renderer.remove(tilemap)
    })
    this.roomEntities.forEach(roomEntity => {
      roomEntity.destroy()
    })
  }
  override tick() {
    this.gfxTilemaps[0]!.offset[0]! -= 1 // TODO: tilemap parallax?
  }
}

function createTilemapsFromBackgroundTilemapDefs(backgroundTilemapDefs: Array<BackgroundTilemapDef>): Array<Tilemap> {
  let index = 0
  return backgroundTilemapDefs.map(backgroundTilemapDef => new Tilemap(
    backgroundTilemapDef.tileset,
    vec3.create(0, 0, --index), // put behind sprites
    backgroundTilemapDef.cols,
    backgroundTilemapDef.tiles,
  ))
}

function spawnRoomEntity(roomEntityDef: RoomEntityDef, ...injectedArgs: RoomEntityInjectedArgs) {
  const Ctor = entityKinds[roomEntityDef.kind]
  return new Ctor(...injectedArgs, ...roomEntityDef.args)
}
