import { singleton } from 'tsyringe'
import { Canvas } from '@/gfx/canvas'
import { resources } from '@/resources/resources'
import { ImageLoader } from '@/gfx/imageLoader'
import { Renderer } from '@/gfx/renderer'
import { TimeStep } from '@/timeStep'
import { Game } from '@/game/game'

@singleton()
export class App {
  constructor(
    private gfx: Canvas,
    private imageLoader: ImageLoader,
    private renderer: Renderer,
    private timeStep: TimeStep,
    private game: Game,
  ) {
  }

  // TODO: FSM with game selection (e.g. new game (choose difficulty) or continue) (this FSM is separate from Game's FSM)
  async start() {
    await this.loadAllResources()
    const _renderStep = this.timeStep.register(0, 60, async () => {
      this.game.update()
      this.gfx.cls()
      this.renderer.tick()
      this.renderer.render()
    })
    this.game.start()
  }

  async loadAllResources() {
    await this.imageLoader.loadAll([
      ...Object.values(resources.frames).map(f => f.src),
      ...Object.values(resources.tilesets).map(f => f.src),
    ])
  }
}
