import { ECS } from '@/game/ecs/ecs'
import { ITickingSystem } from '@/game/ecs/systems/types'
import { RoomContext } from '@/game/roomContext'
import { Canvas } from '@/gfx/canvas'
import { singleton } from 'tsyringe'

@singleton()
export class CameraSystem implements ITickingSystem {
  constructor(
    private ecs: ECS,
    private canvas: Canvas,
  ) {
  }

  tick(roomContext: RoomContext) {
    const playerEntityId = roomContext.playerEntityId
    const position = this.ecs.getComponent(playerEntityId, 'PositionComponent')
    roomContext.camera.offset[0] = position.offset[0]! - this.canvas.el.width / (4 * roomContext.camera.zoom)
    roomContext.camera.offset[1] = position.offset[1]! - this.canvas.el.height / (4 * roomContext.camera.zoom)
  }
}
