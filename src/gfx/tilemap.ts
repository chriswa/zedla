import type { Vec2 } from "@/math/vec2"
import type { Vec3 } from "@/math/vec3"
import type { TilesetDef } from "@/types/TilesetDef"
import type { Renderable } from "./renderer"
import type { Canvas } from "./canvas"
import type { Camera } from "./camera"
import type { ImageLoader } from "./imageLoader"

export class Tilemap implements Renderable {
  private tiles: Uint16Array
  constructor(
    public tilesetDef: TilesetDef,
    public offset: Vec3,
    public parallax: Vec3,
    public size: Vec2,
  ) {
    this.tiles = new Uint16Array(this.size[0]! * this.size[1]!)
  }
  get(x: number, y: number) {
    return this.tiles[x + y * this.size[0]!]
  }
  set(x: number, y: number, newValue: number) {
    this.tiles[x + y * this.size[0]!] = newValue
  }

  getZ() {
    return this.offset[2]!
  }
  render(canvas: Canvas, camera: Camera, imageLoader: ImageLoader) {
    for (let y = 0; y < this.size[1]!; y += 1) {
      for (let x = 0; x < this.size[0]!; x += 1) {
        const tileIndex = this.get(x, y)!
        const tileX = tileIndex % this.tilesetDef.cols
        const tileY = Math.floor(tileIndex / this.tilesetDef.cols)
        canvas.ctx.drawImage(
          imageLoader.get(this.tilesetDef.src),
          tileX * this.tilesetDef.tileWidth,
          tileY * this.tilesetDef.tileHeight,
          this.tilesetDef.tileWidth,
          this.tilesetDef.tileHeight,
          camera.zoom * (x * this.tilesetDef.tileWidth + this.offset[0]! - camera.offset[0]!),
          camera.zoom * (y * this.tilesetDef.tileHeight + this.offset[1]! - camera.offset[1]!),
          camera.zoom * this.tilesetDef.tileWidth,
          camera.zoom * this.tilesetDef.tileHeight,
        )
      }          
    }
  }
}
