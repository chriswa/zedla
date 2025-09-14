export enum Facing {
  LEFT = -1,
  RIGHT = 1,
}

export function facingToDirection(facing: Facing | undefined): -1 | 0 | 1 {
  if (facing === undefined) return 0
  return facing as -1 | 1
}

export function directionToFacing(direction: -1 | 0 | 1): Facing | undefined {
  switch (direction) {
    case -1: return Facing.LEFT
    case 1: return Facing.RIGHT
    case 0: return undefined
    default: {
      throw new Error('Invalid direction. Must be -1, 0, or 1.')
    }
  }
}
