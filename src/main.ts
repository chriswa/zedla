import 'reflect-metadata' // must be first import
import { container } from 'tsyringe'
import { Gfx } from './gfx/gfx'

const gfx = container.resolve(Gfx)

let last = performance.now()
const state = {
  t: 0,
}

function update(dt: number) {
  state.t += dt
}

function render() {
  gfx.cls()
  const ctx = gfx.ctx

  // orbiting dot
  const r = 20
  const x = 100 + Math.cos(state.t) * 60
  const y = 100 + Math.sin(state.t) * 60
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  update(dt)
  render()
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
