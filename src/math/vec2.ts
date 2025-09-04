import type { LayeredBrand } from "@/util/type/brand"

export type Vec2 = LayeredBrand<Float32Array, ['vec2']>

export const vec2 = {
  create(x: number, y: number): Vec2 {
    const out = new Float32Array(2) as Vec2
    out[0] = x
    out[1] = y
    return out
  },

  zero(): Vec2 {
    return new Float32Array(2) as Vec2
  },

  clone(v: Vec2): Vec2 {
    return new Float32Array(v) as Vec2
  },

  set(out: Vec2, x: number, y: number): Vec2 {
    out[0] = x
    out[1] = y
    return out
  },

  copy(out: Vec2, v: Vec2): Vec2 {
    out[0] = v[0]!
    out[1] = v[1]!
    return out
  },

  add(a: Vec2, b: Vec2): Vec2 {
    return new Float32Array([
      a[0]! + b[0]!,
      a[1]! + b[1]!,
    ]) as Vec2
  },

  sub(a: Vec2, b: Vec2): Vec2 {
    return new Float32Array([
      a[0]! - b[0]!,
      a[1]! - b[1]!,
    ]) as Vec2
  },

  mulScalar(v: Vec2, scalar: number): Vec2 {
    return new Float32Array([
      v[0]! * scalar,
      v[1]! * scalar,
    ]) as Vec2
  },

  divScalar(v: Vec2, scalar: number): Vec2 {
    return new Float32Array([
      v[0]! / scalar,
      v[1]! / scalar,
    ]) as Vec2
  },

  lengthSqr(v: Vec2): number {
    return v[0]! * v[0]! + v[1]! * v[1]!
  },

  length(v: Vec2): number {
    return Math.sqrt(vec2.length(v))
  },

  normalize(v: Vec2): Vec2 {
    const len = vec2.length(v)
    return len > 0 ? vec2.divScalar(v, len) : vec2.create(0, 0)
  },

  distance(a: Vec2, b: Vec2): number {
    const dx = a[0]! - b[0]!
    const dy = a[1]! - b[1]!
    return Math.sqrt(dx * dx + dy * dy)
  },

  equals(a: Vec2, b: Vec2): boolean {
    return a[0] === b[0] && a[1] === b[1]
  },

  lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return new Float32Array([
      a[0]! + (b[0]! - a[0]!) * t,
      a[1]! + (b[1]! - a[1]!) * t,
    ]) as Vec2
  },
}
