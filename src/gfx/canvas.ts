import { assertExists } from '@/util/assertExists'
import { singleton } from 'tsyringe'

@singleton()
export class Canvas {
  public el: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D

  constructor() {
    this.el = this.initEl()
    this.ctx = this.initCtx(this.el)
    this.setupResizeHandler()
  }

  protected initEl(): HTMLCanvasElement {
    const el = document.createElement('canvas')
    document.body.appendChild(el)
    return el
  }

  protected initCtx(el: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = assertExists(el.getContext('2d', { alpha: false }))
    // ctx.imageSmoothingEnabled = false
    return ctx
  }

  protected setupResizeHandler(): void {
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const { innerWidth: w, innerHeight: h } = window
      this.el.width = Math.floor(w * dpr)
      this.el.height = Math.floor(h * dpr)
      this.el.style.width = `${w}px`
      this.el.style.height = `${h}px`
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    addEventListener('resize', resize)
    resize()
  }

  public cls() {
    this.ctx.clearRect(0, 0, this.el.width, this.el.height)
  }
}
