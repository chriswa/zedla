export class Grid2D {
  constructor(
    private data: Uint16Array,
    public readonly cols: number,
  ) {
  }

  get rows(): number {
    return this.data.length / this.cols
  }

  get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
      return 0
    }
    return this.data[y * this.cols + x]!
  }

  set(x: number, y: number, value: number): void {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
      throw new Error('grid coords out of bounds for set')
    }
    this.data[y * this.cols + x] = value
  }
}
