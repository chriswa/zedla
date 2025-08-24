import { singleton } from 'tsyringe'
import { Canvas } from '@/gfx/canvas'
import { resources } from '@/resources/resources'
import { ImageLoader } from '@/gfx/imageLoader'
import { Renderer } from '@/gfx/renderer'
// import { TimeStep } from '@/timeStep'
import { Game } from '@/game/game'

@singleton()
export class App {
  constructor(
    private gfx: Canvas,
    private imageLoader: ImageLoader,
    private renderer: Renderer,
    // private timeStep: TimeStep,
    private game: Game,
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
      ...Object.values(resources.frames).map(f => f.src),
      ...Object.values(resources.tilesets).map(f => f.src),
    ])
  }

  private rafCallback(_timestamp: number): void {
    this.game.tick()
    this.renderer.tick()
    this.gfx.cls()
    this.renderer.render()

    requestAnimationFrame(this.rafCallback)
  }
}
