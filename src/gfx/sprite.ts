import type { Vec3 } from "@/math/vec3"
import type { FrameDef } from "@/types/FrameDef"
import type { Canvas } from "./canvas"
import type { Camera } from "./camera"
import type { ImageLoader } from "./imageLoader"
import type { Renderable } from "./renderer"

export class Sprite implements Renderable {
  constructor(
    public frameDef: FrameDef,
    public offset: Vec3,
  ) {
  }
  getZ() {
    return this.offset[2]!
  }
  render(canvas: Canvas, camera: Camera, imageLoader: ImageLoader) {
    canvas.ctx.drawImage(
      imageLoader.get(this.frameDef.src),
      this.frameDef.x,
      this.frameDef.y,
      this.frameDef.w,
      this.frameDef.h,
      camera.zoom * (this.offset[0]! - camera.offset[0]!),
      camera.zoom * (this.offset[1]! - camera.offset[1]!),
      camera.zoom * this.frameDef.w,
      camera.zoom * this.frameDef.h,
    )
  }
}
