import type { Game } from "../game"
import { GameStrategy } from "../gameStrategy"
import { vec3 } from "@/math/vec3"
import { Tilemap } from "@/gfx/tilemap"
import { AnimatedSprite } from "@/gfx/animatedSprite"
import type { RoomDef } from "@/types/roomDef"
import { assert } from "@/util/assert"

export class RoomGameStrategy extends GameStrategy {
  private tilemaps!: Array<Tilemap>
  constructor(
    private game: Game,
    private roomDef: RoomDef,
  ) {
    super()
    this.initializeRoom()
  }
  initializeRoom() {
    assert(this.roomDef.layers.length === 1, 'multiple tile layers not supported yet')
    const tileLayer = this.roomDef.layers[0]!

    this.tilemaps = this.roomDef.layers.map(roomLayerDef => {
      const tilemap = new Tilemap(
        tileLayer.tileset,
        vec3.create(0, 0, -1), // put behind sprites
        tileLayer.cols,
        new Uint16Array(tileLayer.tiles),
      )
      for (let y = 0; y < tilemap.size[1]!; y += 1) {
        for (let x = 0; x < tilemap.size[0]!; x += 1) {
          tilemap.set(x, y, tileLayer.tiles[x + y * tileLayer.cols]!)
        }
      }
      return tilemap
    })
  }
  override start() {
    const ani0 = new AnimatedSprite(vec3.create(32, 32, 0), 'link', 'walk')
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
    // update player, enemies, check for room exit conditions, check for player death
    this.tilemaps[0]!.offset[0]! -= 1
  }
}
