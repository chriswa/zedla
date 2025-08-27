import { singleton } from 'tsyringe'
import { Canvas } from '@/gfx/canvas'
import { ImageLoader } from '@/gfx/imageLoader'
import { Renderer } from '@/gfx/renderer'
import { Game } from '@/game/game'
import { Input } from './input'
import { imageSliceDefs } from '@/resources/imageSliceDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'

@singleton()
export class App {
  constructor(
    private gfx: Canvas,
    private imageLoader: ImageLoader,
    private renderer: Renderer,
    private game: Game,
    private input: Input,
  ) {
    this.rafCallback = this.rafCallback.bind(this)
  }

  // TODO: FSM with game selection (e.g. new game (choose difficulty) or continue) (this FSM is separate from Game's FSM)

  async start() {
    await this.loadAllResources()
    requestAnimationFrame(this.rafCallback)
    this.game.start()
  }

  async loadAllResources() {
    await this.imageLoader.loadAll([
      ...Object.values(imageSliceDefs).map(f => f.src),
      ...Object.values(tilesetDefs).map(f => f.src),
    ])
  }

  private rafCallback(_timestamp: number): void {
    this.input.sample()
    this.game.tick()
    this.renderer.tick()
    this.gfx.cls()
    this.renderer.render()

    requestAnimationFrame(this.rafCallback)
  }
}
