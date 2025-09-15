import { Rect, rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { Grid2D } from '@/util/grid2D'
import { singleton } from 'tsyringe'

@singleton()
export class TileCollisionService {
  constructor() {
  }

  private isSolid(physicsGrid: Grid2D, tileX: number, tileY: number): boolean {
    return physicsGrid.get(tileX, tileY) !== 0
  }

  sweepX(physicsGrid: Grid2D, tileSize: number, worldRect: Rect, deltaX: number): number {
    if (deltaX === 0) return deltaX

    const step = deltaX > 0 ? 1 : -1
    let currentDelta = 0

    while (Math.abs(currentDelta) < Math.abs(deltaX)) {
      const nextDelta = currentDelta + step
      const testRect = rect.add(worldRect, vec2.create(nextDelta, 0))

      // Check collision at the leading edge
      const leadingX = deltaX > 0 ? Math.floor(testRect[2]! / tileSize) : Math.floor(testRect[0]! / tileSize)
      const topY = Math.floor(testRect[1]! / tileSize)
      const bottomY = Math.floor(testRect[3]! / tileSize)

      // Test collision along the leading edge
      for (let tileY = topY; tileY <= bottomY; tileY++) {
        if (this.isSolid(physicsGrid, leadingX, tileY)) {
          return currentDelta
        }
      }

      currentDelta = nextDelta
    }

    return deltaX
  }

  sweepY(physicsGrid: Grid2D, tileSize: number, worldRect: Rect, deltaY: number): number {
    if (deltaY === 0) return deltaY

    const step = deltaY > 0 ? 1 : -1
    let currentDelta = 0

    while (Math.abs(currentDelta) < Math.abs(deltaY)) {
      const nextDelta = currentDelta + step
      const testRect = rect.add(worldRect, vec2.create(0, nextDelta))

      // Check collision at the leading edge
      const leadingY = deltaY > 0 ? Math.floor(testRect[3]! / tileSize) : Math.floor(testRect[1]! / tileSize)
      const leftX = Math.floor(testRect[0]! / tileSize)
      const rightX = Math.floor(testRect[2]! / tileSize)

      // Test collision along the leading edge
      for (let tileX = leftX; tileX <= rightX; tileX++) {
        if (this.isSolid(physicsGrid, tileX, leadingY)) {
          return currentDelta
        }
      }

      currentDelta = nextDelta
    }

    return deltaY
  }
}
