import type { Game } from "../game"
import { GameStrategy } from "../gameStrategy"
import { vec3 } from "@/math/vec3"
import { Tilemap } from "@/gfx/tilemap"
import { AnimatedSprite } from "@/gfx/animatedSprite"
import type { RoomDef } from "@/types/roomDef"
import type { RoomEntity } from "./entity/roomEntity"

// TODO: maybe break RoomRenderer out (as well as RoomSimulation)?

export class RoomGameStrategy extends GameStrategy {
  private tilemaps!: Array<Tilemap>
  private entities = new Set<RoomEntity>() // TODO: maybe not a set?
  constructor(
    private game: Game,
    private roomDef: RoomDef,
  ) {
    super()
    this.initializeTilemaps()
  }
  private initializeTilemaps() {
    let index = 0
    this.tilemaps = this.roomDef.backgroundTilemaps.map(backgroundTilemapDef => new Tilemap(
      backgroundTilemapDef.tileset,
      vec3.create(0, 0, --index), // put behind sprites
      backgroundTilemapDef.cols,
      backgroundTilemapDef.tiles,
    ))
  }
  override start() {
    const ani0 = new AnimatedSprite('link', 'walk')
    vec3.setComponents(ani0.offset, 32, 32, 0)
    this.game.renderer.add(ani0)
    this.tilemaps.forEach(tilemap => {
      this.game.renderer.add(tilemap)
    })
  }
  override stop() {
    // this.game.renderer.remove(ani0)
    this.tilemaps.forEach(tilemap => {
      this.game.renderer.remove(tilemap)
    })
  }
  override tick() {
    this.tilemaps[0]!.offset[0]! -= 1 // TODO: tilemap parallax?
  }
}
