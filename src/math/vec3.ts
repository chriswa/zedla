import type { LayeredBrand } from "@/util/brand"

export type Vec3 = LayeredBrand<Float32Array, ['vec2', 'vec3']>

export const vec3 = {
  create(x: number, y: number, z: number): Vec3 {
    const out = new Float32Array(3) as Vec3
    out[0] = x
    out[1] = y
    out[2] = z
    return out
  },

  zero(): Vec3 {
    return new Float32Array(3) as Vec3
  },

  clone(v: Vec3): Vec3 {
    return new Float32Array(v) as Vec3
  },

  setComponents(out: Vec3, x: number, y: number, z: number): Vec3 {
    out[0] = x
    out[1] = y
    out[2] = z
    return out
  },

  setVec3(out: Vec3, v: Vec3): void {
    out[0] = v[0]!
    out[1] = v[1]!
    out[2] = v[2]!
  },

  add(a: Vec3, b: Vec3): Vec3 {
    return new Float32Array([
      a[0]! + b[0]!,
      a[1]! + b[1]!,
      a[2]! + b[2]!,
    ]) as Vec3
  },

  sub(a: Vec3, b: Vec3): Vec3 {
    return new Float32Array([
      a[0]! - b[0]!,
      a[1]! - b[1]!,
      a[2]! - b[2]!,
    ]) as Vec3
  },

  mulScalar(v: Vec3, scalar: number): Vec3 {
    return new Float32Array([
      v[0]! * scalar,
      v[1]! * scalar,
      v[2]! * scalar,
    ]) as Vec3
  },

  divScalar(v: Vec3, scalar: number): Vec3 {
    return new Float32Array([
      v[0]! / scalar,
      v[1]! / scalar,
      v[2]! / scalar,
    ]) as Vec3
  },

  lengthSqr(v: Vec3): number {
    return v[0]! * v[0]! + v[1]! * v[1]! + v[2]! * v[2]!
  },

  length(v: Vec3): number {
    return Math.sqrt(vec3.length(v))
  },

  normalize(v: Vec3): Vec3 {
    const len = vec3.length(v)
    return len > 0 ? vec3.divScalar(v, len) : vec3.create(0, 0, 0)
  },

  distance(a: Vec3, b: Vec3): number {
    const dx = a[0]! - b[0]!
    const dy = a[1]! - b[1]!
    const dz = a[2]! - b[2]!
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  equals(a: Vec3, b: Vec3): boolean {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  },
}
