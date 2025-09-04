import { inject, Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { RoomDefToken, type RoomDef } from "@/types/roomDef";
import { Canvas } from "@/gfx/canvas";
import { ImageLoader } from "@/gfx/imageLoader";
import { Camera } from "@/gfx/camera";
import { ECS } from "../ecs";
import { assertExists } from "@/util/assertExists";
import { vec2 } from "@/math/vec2";
import { rect } from "@/math/rect";

const DO_INTERPOLATION = false
const RENDER_PHYSICS_HITBOXES = true

@scoped(Lifecycle.ContainerScoped)
export class RenderSystem implements ISystem, Disposable {
  constructor(
    @inject(RoomDefToken) private roomDef: RoomDef,
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
    if (RENDER_PHYSICS_HITBOXES) {
      this.renderPhysicsHitboxes(renderBlend)
    }
  }
  private renderSprites(renderBlend: number) {
    // TODO: sort order by Z?
    const interpolatedCameraOffset = DO_INTERPOLATION ? vec2.lerp(this.camera.previousOffset, this.camera.offset, renderBlend) : this.camera.offset
    
    this.ecs.entities.forEach((components, _entityId) => {
      const spriteComponent = components.SpriteComponent
      if (spriteComponent !== undefined) {
        const positionComponent = assertExists(components.PositionComponent)
        const frameDef = spriteComponent.frameDef
        
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
    })
  }
  private renderTilemaps() {
    this.roomDef.backgroundTilemaps.forEach(backgroundTilemapDef => {
      const tileset = backgroundTilemapDef.tileset
      let tilemapX = 0
      let tilemapY = 0
      for (let i = 0; i < backgroundTilemapDef.tiles.length; i += 1) {
        const tileIndex = backgroundTilemapDef.tiles[i]!
        const tilesetX = tileIndex % tileset.cols
        const tilesetY = Math.floor(tileIndex / tileset.cols)
        this.canvas.ctx.drawImage(
          this.imageLoader.get(tileset.src),
          tilesetX * tileset.tileWidth,
          tilesetY * tileset.tileHeight,
          tileset.tileWidth,
          tileset.tileHeight,
          this.camera.zoom * (tilemapX * tileset.tileWidth - this.camera.offset[0]!),
          this.camera.zoom * (tilemapY * tileset.tileHeight - this.camera.offset[1]!),
          this.camera.zoom * tileset.tileWidth,
          this.camera.zoom * tileset.tileHeight,
        )

        // advance tile coords
        tilemapX += 1
        if (tilemapX >= backgroundTilemapDef.cols) {
          tilemapX = 0
          tilemapY += 1
        }
      }
    })
  }
  private renderPhysicsHitboxes(renderBlend: number) {
    const interpolatedCameraOffset = DO_INTERPOLATION ? vec2.lerp(this.camera.previousOffset, this.camera.offset, renderBlend) : this.camera.offset
    
    this.ecs.entities.forEach((components, _entityId) => {
      const physicsBodyComponent = components.PhysicsBodyComponent
      const positionComponent = components.PositionComponent
      
      if (physicsBodyComponent && positionComponent) {
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
    })
  }
  dispose() {
  }
}
