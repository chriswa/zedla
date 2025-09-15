import { Brand } from '@/util/type/brand'

export enum CombatBit {
  PlayerWeaponHurtingEnemy = 1 << 0,
  EnemyWeaponHurtingPlayer = 1 << 1,
  PlayerHurtingPickup = 1 << 2,
  EnemyHurtingEnemy = 1 << 3,
}

export type CombatMask = Brand<number, 'CombatMask'>

export const COMBAT_MASK_NONE = 0 as CombatMask

export function createCombatMask(...bits: Array<CombatBit>): CombatMask {
  let m = 0
  for (const b of bits) m |= b
  return m as CombatMask
}

export function masksOverlap(a: CombatMask, b: CombatMask): boolean {
  return ((a as number) & (b as number)) !== 0
}
