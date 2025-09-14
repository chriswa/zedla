import { singleton, type Disposable } from "tsyringe";

import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import { RoomContext } from "@/game/roomContext";
import { Canvas } from "@/gfx/canvas";

@singleton()
export class CameraSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
    private canvas: Canvas,
  ) {
  }
  tick(roomContext: RoomContext) {
    const playerEntityId = roomContext.playerEntityId
    const position = this.ecs.getComponent(playerEntityId, 'PositionComponent')

    if (position) {
      roomContext.camera.offset[0] = position.offset[0]! - this.canvas.el.width / (4 * roomContext.camera.zoom)
      roomContext.camera.offset[1] = position.offset[1]! - this.canvas.el.height / (4 * roomContext.camera.zoom)
    }
  }
  dispose() {
  }
}