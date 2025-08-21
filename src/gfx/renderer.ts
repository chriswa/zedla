import { singleton } from 'tsyringe'
import { Camera } from './camera'
import { Canvas } from './canvas'
import { ImageLoader } from './imageLoader'
import { assert } from '@/util/assert'

export interface Renderable {
  getZ(): number
  render(canvas: Canvas, camera: Camera, imageLoader: ImageLoader): void
}

@singleton()
export class Renderer {
  private readonly items: Set<Renderable> = new Set()
  constructor(
    private canvas: Canvas,
    private imageLoader: ImageLoader,
    private camera: Camera,
  ) {
  }
  add(item: Renderable) {
    assert(!this.items.has(item))
    this.items.add(item)
  }
  remove(item: Renderable) {
    assert(this.items.has(item))
    this.items.delete(item)
  }
  render() {
    this.canvas.ctx.imageSmoothingEnabled = false
    Array.from(this.items)
      .sort((a, b) => a.getZ() - b.getZ()) // z-sort
      .forEach(item => {
        item.render(this.canvas, this.camera, this.imageLoader)
      })
  }
}
