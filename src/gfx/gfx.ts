import { assertExists } from '@/util/assertExists'
import { injectable } from 'tsyringe'

@injectable()
export class Gfx {
  public readonly canvas: HTMLCanvasElement
  public readonly ctx: CanvasRenderingContext2D
  constructor() {
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)

    this.ctx = assertExists(this.canvas.getContext('2d', { alpha: false }))

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const { innerWidth: w, innerHeight: h } = window
      this.canvas.width = Math.floor(w * dpr)
      this.canvas.height = Math.floor(h * dpr)
      this.canvas.style.width = `${w}px`
      this.canvas.style.height = `${h}px`
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    addEventListener('resize', resize)
    resize()
  }
  public cls() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = '#111'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
