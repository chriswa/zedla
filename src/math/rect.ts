import { vec2, type Vec2 } from "./vec2"

import type { LayeredBrand } from "@/util/type/brand"

export type Rect = LayeredBrand<Float32Array, ['rect']>

export const rect = {
  createFromCorners(x0: number, y0: number, x1: number, y1: number): Rect {
    const out = new Float32Array(4) as Rect
    out[0] = x0
    out[1] = y0
    out[2] = x1
    out[3] = y1
    return out
  },

  createCentred(x: number, y: number, w: number, h: number): Rect {
    const hw = w / 2
    const hh = h / 2
    return rect.createFromCorners(x - hw, y - hh, x + hw, y + hh)
  },
  zero(): Rect {
    return new Float32Array(4) as Rect
  },
  clone(r: Rect): Rect {
    return new Float32Array(r) as Rect
  },


  topLeft(r: Rect): Vec2 {
    return vec2.create(r[0]!, r[1]!)
  },
  bottomRight(r: Rect): Vec2 {
    return vec2.create(r[2]!, r[3]!)
  },
  size(r: Rect): Vec2 {
    return vec2.create(r[2]! - r[0]!, r[3]! - r[1]!)
  },
  centre(r: Rect): Vec2 {
    return vec2.create((r[0]! + r[2]!) / 2, (r[1]! + r[3]!) / 2)
  },

  add(r: Rect, v: Vec2): Rect {
    return new Float32Array([
      r[0]! + v[0]!,
      r[1]! + v[1]!,
      r[2]! + v[0]!,
      r[3]! + v[1]!,
    ]) as Rect
  },
  sub(r: Rect, v: Vec2): Rect {
    return new Float32Array([
      r[0]! - v[0]!,
      r[1]! - v[1]!,
      r[2]! - v[0]!,
      r[3]! - v[1]!,
    ]) as Rect
  },
}
