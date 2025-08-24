import type { Vec3 } from "@/math/vec3"
import type { ImageSlice } from "@/types/ImageSlice"
import type { Canvas } from "./canvas"
import type { Camera } from "./camera"
import type { ImageLoader } from "./imageLoader"
import type { Renderable } from "./renderer"

export class Sprite implements Renderable {
  constructor(
    public offset: Vec3,
    public frameDef: ImageSlice,
  ) {
  }
  getZ() {
    return this.offset[2]!
  }
  tick() {
  }
  render(canvas: Canvas, camera: Camera, imageLoader: ImageLoader) {
    canvas.ctx.drawImage(
      imageLoader.get(this.frameDef.src),
      this.frameDef.x,
      this.frameDef.y,
      this.frameDef.w,
      this.frameDef.h,
      camera.zoom * (this.offset[0]! - camera.offset[0]! - this.frameDef.offsetX),
      camera.zoom * (this.offset[1]! - camera.offset[1]! + this.frameDef.offsetY),
      camera.zoom * this.frameDef.w,
      camera.zoom * this.frameDef.h,
    )
    canvas.ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black'
    canvas.ctx.fillRect(
      camera.zoom * (this.offset[0]! - camera.offset[0]!) - 2,
      camera.zoom * (this.offset[1]! - camera.offset[1]!) - 2,
      4,
      4,
    )
  }
}
