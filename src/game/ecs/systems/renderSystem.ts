import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { ECS } from "../ecs";


import { RoomContext } from "@/game/roomContext";
import { Camera } from "@/gfx/camera";
import { Canvas } from "@/gfx/canvas";
import { ImageLoader } from "@/gfx/imageLoader";
import { rect } from "@/math/rect";
import type { Rect } from "@/math/rect";
import { vec2, type Vec2 } from "@/math/vec2";
import type { SpriteFrameDef } from "@/types/spriteFrameDef";
import { assertExists } from "@/util/assertExists";
import { Facing } from "@/types/facing";
import type { PositionComponent } from "../components";

const DO_INTERPOLATION: boolean = false
const RENDER_PHYSICS_BOXES: boolean = true
const RENDER_COMBAT_BOXES: boolean = true

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
    if (RENDER_PHYSICS_BOXES) {
      this.renderPhysicsBoxes(renderBlend)
    }
    if (RENDER_COMBAT_BOXES) {
      this.renderCombatBoxes(renderBlend)
    }
  }
  private renderSprites(renderBlend: number) {
    const camOffset = this.getInterpolatedCameraOffset(renderBlend)
    for (const [_entityId, components] of this.ecs.entities.entries()) {
      const spriteComponent = components.SpriteComponent
      if (!spriteComponent) continue
      const positionComponent = assertExists(components.PositionComponent)
      const facing = components.FacingComponent?.value ?? Facing.RIGHT
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)
      const { x, y, w, h } = this.computeSpriteDest(pos, camOffset, spriteComponent.spriteFrameDef)
      this.drawSprite(spriteComponent.spriteFrameDef, x, y, w, h, facing)
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
  private renderPhysicsBoxes(renderBlend: number) {
    const camOffset = this.getInterpolatedCameraOffset(renderBlend)
    for (const [_entityId, components] of this.ecs.entities.entries()) {
      const physicsBody = components.PhysicsBodyComponent
      const positionComponent = components.PositionComponent
      if (!physicsBody || !positionComponent) continue
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)
      const worldRect = rect.add(physicsBody.rect, pos)
      this.strokeWorldRect(worldRect, camOffset, 'red')
    }
  }

  private renderCombatBoxes(renderBlend: number) {
    const camOffset = this.getInterpolatedCameraOffset(renderBlend)
    for (const [_entityId, components] of this.ecs.entities.entries()) {
      const positionComponent = components.PositionComponent
      if (!positionComponent) continue
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)

      const hurt = components.HurtboxComponent
      if (hurt && hurt.enabled) {
        const worldRect = rect.add(hurt.rect, pos)
        this.strokeWorldRect(worldRect, camOffset, 'rgba(255,0,255,0.9)')
      }
      const hit = components.HitboxComponent
      if (hit && hit.enabled) {
        const worldRect = rect.add(hit.rect, pos)
        this.strokeWorldRect(worldRect, camOffset, 'rgba(0,255,255,0.9)')
      }
    }
  }

  private getInterpolatedCameraOffset(renderBlend: number): Vec2 {
    return DO_INTERPOLATION ? vec2.lerp(this.camera.previousOffset, this.camera.offset, renderBlend) : this.camera.offset
  }

  private getInterpolatedPosition(positionComponent: PositionComponent, renderBlend: number): Vec2 {
    return DO_INTERPOLATION ? vec2.lerp(positionComponent.previousOffset, positionComponent.offset, renderBlend) : positionComponent.offset
  }

  private toScreenRect(worldRect: Rect, camOffset: Vec2) {
    const z = this.camera.zoom
    const x = z * (worldRect[0]! - camOffset[0]!)
    const y = z * (worldRect[1]! - camOffset[1]!)
    const w = z * (worldRect[2]! - worldRect[0]!)
    const h = z * (worldRect[3]! - worldRect[1]!)
    return { x, y, w, h }
  }

  private strokeWorldRect(worldRect: Rect, camOffset: Vec2, color: string) {
    const { x, y, w, h } = this.toScreenRect(worldRect, camOffset)
    this.canvas.ctx.strokeStyle = color
    this.canvas.ctx.lineWidth = 1
    this.canvas.ctx.strokeRect(x, y, w, h)
  }

  private computeSpriteDest(pos: Vec2, camOffset: Vec2, frameDef: SpriteFrameDef) {
    const z = this.camera.zoom
    const x = z * (Math.round(pos[0]!) - Math.round(camOffset[0]!) - frameDef.offsetX)
    const y = z * (Math.round(pos[1]!) - Math.round(camOffset[1]!) + frameDef.offsetY)
    const w = z * frameDef.w
    const h = z * frameDef.h
    return { x, y, w, h }
  }

  private drawSprite(frameDef: { src: string; x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number, facing: Facing) {
    const img = this.imageLoader.get(frameDef.src)
    if (facing === Facing.LEFT) {
      this.canvas.ctx.save()
      this.canvas.ctx.scale(-1, 1)
      this.canvas.ctx.drawImage(img, frameDef.x, frameDef.y, frameDef.w, frameDef.h, -x - w, y, w, h)
      this.canvas.ctx.restore()
    } else {
      this.canvas.ctx.drawImage(img, frameDef.x, frameDef.y, frameDef.w, frameDef.h, x, y, w, h)
    }
  }
  dispose() {
  }
}
