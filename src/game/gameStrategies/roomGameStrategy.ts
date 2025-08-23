import { resources } from "@/resources/resources";
import type { Game } from "../game";
import { GameStrategy } from "./gameStrategy";
import { vec3 } from "@/math/vec3";
import { Tilemap } from "@/gfx/tilemap";
import { vec2 } from "@/math/vec2";
import { AnimatedSprite } from "@/gfx/animatedSprite";

export class RoomGameStrategy extends GameStrategy {
  private tilemap: Tilemap
  constructor(
    private game: Game,
    // TODO: caller passes in ROOM STUFF
  ) {
    super()

    this.tilemap = new Tilemap(
      resources.tilesets.tiles4,
      vec3.create(0, 0, -1), // put behind sprites
      vec2.create(16, 16),
    )
    for (let y = 0; y < this.tilemap.size[1]!; y += 1) {
      for (let x = 0; x < this.tilemap.size[0]!; x += 1) {
        this.tilemap.set(x, y, Math.floor(Math.random() * 256))
      }
    }
  }
  start() {
    const ani0 = new AnimatedSprite(vec3.create(32, 32, 0), 'link', 'walk')
    this.game.renderer.add(ani0)

    this.game.renderer.add(this.tilemap)
  }
  update() {
    // update player, enemies, check for room exit conditions, check for player death
    this.tilemap.offset[1]! += 1
  }
}
