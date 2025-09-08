import { singleton } from 'tsyringe'

import { Canvas } from '@/gfx/canvas'

interface PermanentMsg { id: string; text: string; sort: number }
interface EphemeralMsg { text: string; timeAddedMs: number }

@singleton()
export class CanvasLog {
  private permanents = new Map<string, PermanentMsg>()
  private ephemerals: EphemeralMsg[] = []

  // Timing in milliseconds: 3s solid + 1s fade
  private readonly LIFE_MS = 3000
  private readonly FADE_MS = 1000
  private readonly LINE_HEIGHT = 16 // px
  private readonly LEFT_MARGIN = 8 // px
  private readonly BOTTOM_MARGIN = 8 // px
  private readonly FONT = '14px Menlo, Consolas, monospace'

  constructor(private canvas: Canvas) {}

  upsertPermanent(id: string, text: string, sort: number): void {
    this.permanents.set(id, { id, text, sort })
  }

  postEphemeral(text: string): void {
    this.ephemerals.push({ text, timeAddedMs: performance.now() })
  }

  render(): void {
    const now = performance.now()
    const ctx = this.canvas.ctx
    ctx.save()
    try {
      ctx.font = this.FONT
      ctx.textBaseline = 'bottom'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 3

      const viewH = this.canvas.el.clientHeight
      let y = viewH - this.BOTTOM_MARGIN
      const x = this.LEFT_MARGIN

      // Draw permanent messages (bottom-up)
      const sortedPerms = Array.from(this.permanents.values()).sort((a, b) => a.sort - b.sort)
      for (const p of sortedPerms) {
        this.drawOutlinedText(ctx, p.text, x, y, '#ffffff')
        y -= this.LINE_HEIGHT
      }

      // Cull and draw ephemeral messages (above permanents)
      const maxAgeMs = this.LIFE_MS + this.FADE_MS
      this.ephemerals = this.ephemerals.filter(e => (now - e.timeAddedMs) < maxAgeMs)

      // Draw ephemerals newest-first (closer to permanents), stacking upward
      for (let i = this.ephemerals.length - 1; i >= 0; i--) {
        const e = this.ephemerals[i]!
        const ageMs = now - e.timeAddedMs
        let color = '#ffff00' // yellow
        if (ageMs > this.LIFE_MS) {
          const t = Math.min(1, (ageMs - this.LIFE_MS) / this.FADE_MS)
          // fade yellow -> black by scaling channels
          const k = 1 - t
          const r = Math.round(255 * k)
          const g = Math.round(255 * k)
          color = `rgb(${r},${g},0)`
        }
        this.drawOutlinedText(ctx, e.text, x, y, color)
        y -= this.LINE_HEIGHT
      }
    } finally {
      ctx.restore()
    }
  }

  private drawOutlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.fillStyle = color
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }
}
