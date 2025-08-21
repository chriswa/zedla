import { singleton } from 'tsyringe'
import { Canvas } from '@/gfx/canvas'
import { resources } from '@/resources/resources'
import { vec3 } from '@/math/vec3'
import { ImageLoader } from '@/gfx/imageLoader'
import { Sprite } from '@/gfx/sprite'
import { Tilemap } from '@/gfx/tilemap'
import { vec2 } from '@/math/vec2'
import type { TilesetDef } from '@/types/TilesetDef'
import { Renderer } from '@/gfx/renderer'

@singleton()
export class App {
  constructor(
    private gfx: Canvas,
    private imageLoader: ImageLoader,
    private renderer: Renderer,
  ) {
  }
  async start() {
    await this.imageLoader.loadAll(Object.values(resources.frames).map(f => f.src))
    const spr0 = new Sprite(
      resources.frames.link_walk_1,
      vec3.create(0, 0, 0),
    )
    spr0.offset[0] = 16
    spr0.offset[1] = 8
    this.renderer.add(spr0)

    await this.imageLoader.loadAll(Object.values(resources.tilesets).map(f => f.src))
    const tilemap = new Tilemap(
      resources.tilesets.tiles4,
      vec3.create(0, 0, -1), // put behind sprites
      vec2.create(16, 16),
    )
    for (let y = 0; y < tilemap.size[1]!; y += 1) {
      for (let x = 0; x < tilemap.size[0]!; x += 1) {
        tilemap.set(x, y, Math.floor(Math.random() * 256))
      }
    }
    this.renderer.add(tilemap)

    let last = performance.now()

    const update = (dt: number) => {
      spr0.offset[0]! += dt * 5
      spr0.offset[1]! += dt * 5
      spr0.frameDef = Math.random() < 0.5 ? resources.frames.link_walk_1 : resources.frames.link_walk_2
    }

    const render = () => {
      this.gfx.cls()
      this.renderer.render()
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      update(dt)
      render()
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)

  }
}
