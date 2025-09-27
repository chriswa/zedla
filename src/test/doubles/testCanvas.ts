import { Canvas } from '@/gfx/canvas'
import { createStrictMock } from '@/util/createStrictMock'
import { singleton } from 'tsyringe'

@singleton()
export class TestCanvas extends Canvas {
  init() {
    this.el = createStrictMock<HTMLCanvasElement>({
      width: 800,
      height: 600,
      clientHeight: 800,
      clientWidth: 800,
      style: createStrictMock<CSSStyleDeclaration>({}),
    })

    this.ctx = createStrictMock<CanvasRenderingContext2D>({
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

  public cls() {
  }
}
