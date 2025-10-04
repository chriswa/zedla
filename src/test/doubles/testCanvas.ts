import { Canvas } from '@/gfx/canvas'
import { createStrictMock } from '@/util/createStrictMock'
import { singleton } from 'tsyringe'

@singleton()
export class TestCanvas extends Canvas {
  protected override initEl(): HTMLCanvasElement {
    return createStrictMock<HTMLCanvasElement>({
      width: 800,
      height: 600,
      clientHeight: 800,
      clientWidth: 800,
      style: createStrictMock<CSSStyleDeclaration>({}),
    })
  }

  protected override initCtx(_el: HTMLCanvasElement): CanvasRenderingContext2D {
    return createStrictMock<CanvasRenderingContext2D>({
      clearRect: () => {},
      setTransform: () => {},
      save: () => {},
      restore: () => {},
      fillText: () => {},
      strokeText: () => {},

      font: '',
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      textBaseline: 'middle',
      lineJoin: 'round',
      lineWidth: 1,
    })
  }

  protected override setupResizeHandler(): void {
    // No-op in tests - skip DOM event listeners and resize logic
  }

  public override cls() {
    // No-op in tests
  }
}
