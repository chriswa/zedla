import { Brand } from '@/util/type/brand'

export enum AnimationFrameFlag {
  SwordSwing = 1 << 0,
  CameraShake = 1 << 1,
  IFrames = 1 << 2,
  Footstep = 1 << 3,
  CanInterrupt = 1 << 4,
}

export type AnimationFrameBits = Brand<number, 'AnimationFrameBits'>

export function createAnimationFrameBits(...flags: Array<AnimationFrameFlag>): AnimationFrameBits {
  let m = 0
  for (const f of flags) { m |= f }
  return m as AnimationFrameBits
}

export function hasFrameFlag(mask: AnimationFrameBits | undefined, flag: AnimationFrameFlag): boolean {
  return mask !== undefined && (((mask as unknown as number) & flag) !== 0)
}
