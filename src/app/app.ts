import { Input } from '@/app/input'
import { CanvasLog } from '@/dev/canvasLog'
import { Game } from '@/game/game'
import { ImageLoader } from '@/gfx/imageLoader'
import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'
import { FixedTimeStep } from '@/util/fixedTimeStep'
import { singleton } from 'tsyringe'

@singleton()
export class App {
  private _lastRafTs: number | undefined
  constructor(
    private imageLoader: ImageLoader,
    private input: Input,
    private game: Game,
    private fixedTimeStep: FixedTimeStep,
    private canvasLog: CanvasLog,
  ) {}

  // TODO: Fsm with game selection (e.g. new game (choose difficulty) or continue) (this Fsm is separate from Game's Fsm)

  async boot() {
    await this.loadAllMediaAssets()
    requestAnimationFrame((timestamp) => this.rafCallback(timestamp))
    this.game.boot()
  }

  async loadAllMediaAssets() {
    await this.imageLoader.loadAll([
      ...Object.values(spriteFrameDefs).map((f) => f.src),
      ...Object.values(tilesetDefs).map((f) => f.src),
    ])
  }

  private rafCallback(timestamp: number): void {
    if (this._lastRafTs !== undefined) {
      const dt = timestamp - this._lastRafTs
      this.canvasLog.upsertPermanent('raf-dt', `RAF dt: ${dt.toFixed(1)} ms`, 0)
    }
    this._lastRafTs = timestamp

    // tick the fixed step logic 0 or more times depending on elapsed time
    const renderBlend = this.fixedTimeStep.tick(timestamp, () => {
      this.input.sample()
      this.game.tick()
    })

    this.game.render(renderBlend)
    this.canvasLog.render()

    requestAnimationFrame((timestamp) => this.rafCallback(timestamp))
  }
}
