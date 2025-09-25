import { singleton } from 'tsyringe'

@singleton()
export class BrowserFrameScheduler {
  forever(callback: (timestamp: number) => void): void {
    const loop = (timestamp: number) => {
      callback(timestamp)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}
