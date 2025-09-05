import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { ECS } from "../ecs";


import { RoomContext } from "@/game/roomContext";
import { Camera } from "@/gfx/camera";
import { Canvas } from "@/gfx/canvas";
import { ImageLoader } from "@/gfx/imageLoader";
import { rect } from "@/math/rect";
import { vec2 } from "@/math/vec2";
import { assertExists } from "@/util/assertExists";

const DO_INTERPOLATION = false
const RENDER_PHYSICS_HITBOXES = true

@scoped(Lifecycle.ContainerScoped)
export class RenderSystem implements Disposable {
  constructor(
    private roomContext: RoomContext,
    private canvas: Canvas,
    private imageLoader: ImageLoader,
    private camera: Camera,
    private ecs: ECS,
  ) {
  }
  render(renderBlend: number) {
    this.canvas.ctx.imageSmoothingEnabled = false
    this.renderTilemaps()
    this.renderSprites(renderBlend)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (RENDER_PHYSICS_HITBOXES) {
      this.renderPhysicsHitboxes(renderBlend)
    }
  }
  private renderSprites(renderBlend: number) {
    // TODO: sort order by Z?
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const interpolatedCameraOffset = DO_INTERPOLATION ? vec2.lerp(this.camera.previousOffset, this.camera.offset, renderBlend) : this.camera.offset
    
    for (const [_entityId, components] of this.ecs.entities.entries()) {
      const spriteComponent = components.SpriteComponent
      if (spriteComponent !== undefined) {
        const positionComponent = assertExists(components.PositionComponent)
        const frameDef = spriteComponent.frameDef
        
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const interpolatedPosition = DO_INTERPOLATION ? vec2.lerp(positionComponent.previousOffset, positionComponent.offset, renderBlend) : positionComponent.offset
        
        this.canvas.ctx.drawImage(
          this.imageLoader.get(frameDef.src),
          frameDef.x,
          frameDef.y,
          frameDef.w,
          frameDef.h,
          this.camera.zoom * (Math.round(interpolatedPosition[0]!) - Math.round(interpolatedCameraOffset[0]!) - frameDef.offsetX),
          this.camera.zoom * (Math.round(interpolatedPosition[1]!) - Math.round(interpolatedCameraOffset[1]!) + frameDef.offsetY),
          this.camera.zoom * frameDef.w,
          this.camera.zoom * frameDef.h,
        )
      }
    }
  }
  private renderTilemaps() {
    for (const [gridIndex, backgroundTilemapDef] of this.roomContext.roomDef.backgroundTilemaps.entries()) {
      const tileset = backgroundTilemapDef.tileset
      const grid = this.roomContext.backgroundGrids[gridIndex]!
      
      for (let tileY = 0; tileY < grid.rows; tileY++) {
        for (let tileX = 0; tileX < grid.cols; tileX++) {
          const tileIndex = grid.get(tileX, tileY)
          // if (tileIndex === 0) continue // Skip empty tiles
          
          const tilesetX = tileIndex % tileset.cols
          const tilesetY = Math.floor(tileIndex / tileset.cols)
          this.canvas.ctx.drawImage(
            this.imageLoader.get(tileset.src),
            tilesetX * tileset.tileWidth,
            tilesetY * tileset.tileHeight,
            tileset.tileWidth,
            tileset.tileHeight,
            this.camera.zoom * (tileX * tileset.tileWidth - this.camera.offset[0]!),
            this.camera.zoom * (tileY * tileset.tileHeight - this.camera.offset[1]!),
            this.camera.zoom * tileset.tileWidth,
            this.camera.zoom * tileset.tileHeight,
          )
        }
      }
    }
  }
  private renderPhysicsHitboxes(renderBlend: number) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const interpolatedCameraOffset = DO_INTERPOLATION ? vec2.lerp(this.camera.previousOffset, this.camera.offset, renderBlend) : this.camera.offset
    
    for (const [_entityId, components] of this.ecs.entities.entries()) {
      const physicsBodyComponent = components.PhysicsBodyComponent
      const positionComponent = components.PositionComponent
      
      if (physicsBodyComponent && positionComponent) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const interpolatedPosition = DO_INTERPOLATION ? vec2.lerp(positionComponent.previousOffset, positionComponent.offset, renderBlend) : positionComponent.offset
        
        const worldRect = rect.add(physicsBodyComponent.rect, interpolatedPosition)
        
        this.canvas.ctx.strokeStyle = 'red'
        this.canvas.ctx.lineWidth = 1
        this.canvas.ctx.strokeRect(
          this.camera.zoom * (worldRect[0]! - interpolatedCameraOffset[0]!),
          this.camera.zoom * (worldRect[1]! - interpolatedCameraOffset[1]!),
          this.camera.zoom * (worldRect[2]! - worldRect[0]!),
          this.camera.zoom * (worldRect[3]! - worldRect[1]!)
        )
      }
    }
  }
  dispose() {
  }
}
