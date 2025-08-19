import 'reflect-metadata' // must be first import
import { container } from 'tsyringe'
import { assertExists } from '@/util/typeUtil'
import { Foo } from './foo'

console.log(Reflect.getMetadata('design:paramtypes', Foo))

const foo = container.resolve(Foo)
foo.hello()

type Vec2 = Readonly<{ x: number; y: number }>

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const ctx = assertExists(canvas.getContext('2d', { alpha: false }))

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const { innerWidth: w, innerHeight: h } = window
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
addEventListener('resize', resize)
resize()

let last = performance.now()
const state = {
  t: 0,
  mouse: { x: 0, y: 0 } as Vec2,
}

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect()
  state.mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
})

function update(dt: number) {
  state.t += dt
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  console.log('render')

  // bg
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // orbiting dot
  const r = 20
  const x = 100 + Math.cos(state.t) * 60
  const y = 100 + Math.sin(state.t) * 60
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  // mouse ring
  ctx.strokeStyle = 'white'
  ctx.beginPath()
  ctx.arc(state.mouse.x, state.mouse.y, 30, 0, Math.PI * 2)
  ctx.stroke()
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  update(dt)
  render()
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
