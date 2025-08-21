import { assertExists } from '@/util/assertExists'
import { singleton } from 'tsyringe'

@singleton()
export class Canvas {
  public readonly el: HTMLCanvasElement
  public readonly ctx: CanvasRenderingContext2D
  constructor() {
    this.el = document.createElement('canvas')
    document.body.appendChild(this.el)

    this.ctx = assertExists(this.el.getContext('2d', { alpha: false }))
    // this.ctx.imageSmoothingEnabled = false

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
