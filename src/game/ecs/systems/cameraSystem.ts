import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import { RoomContext } from "@/game/roomContext";
import { Camera } from "@/gfx/camera";
import { Canvas } from "@/gfx/canvas";

@scoped(Lifecycle.ContainerScoped)
export class CameraSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
    private camera: Camera,
    private canvas: Canvas,
  ) {
  }
  tick() {
    const playerEntityId = this.roomContext.playerEntityId
    const position = this.ecs.getComponent(playerEntityId, 'PositionComponent')
    
    if (position) {
      this.camera.offset[0] = position.offset[0]! - this.canvas.el.width / (4 * this.camera.zoom)
      this.camera.offset[1] = position.offset[1]! - this.canvas.el.height / (4 * this.camera.zoom)
    }
  }
  dispose() {
  }
}