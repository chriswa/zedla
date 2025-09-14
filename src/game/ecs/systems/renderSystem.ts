import { singleton, type Disposable } from "tsyringe";

import { ECS } from "../ecs";


import type { PositionComponent } from "../components";
import type { Rect } from "@/math/rect";
import type { SpriteFrameDef } from "@/types/spriteFrameDef";

import { RoomContext } from "@/game/roomContext";
import { Canvas } from "@/gfx/canvas";
import { ImageLoader } from "@/gfx/imageLoader";
import { rect } from "@/math/rect";
import { vec2, type Vec2 } from "@/math/vec2";
import { Facing } from "@/types/facing";
import { assertExists } from "@/util/assertExists";

const DO_INTERPOLATION = false as boolean
const RENDER_PHYSICS_BOXES = true as boolean
const RENDER_COMBAT_BOXES = true as boolean
const RENDER_ANCHORS = true as boolean

@singleton()
export class RenderSystem implements Disposable {
  constructor(
    private canvas: Canvas,
    private imageLoader: ImageLoader,
    private ecs: ECS,
  ) {
  }
  private frameCounter = 0
  render(renderBlend: number, roomContext: RoomContext) {
    this.frameCounter++
    this.canvas.cls()
    this.canvas.ctx.imageSmoothingEnabled = false
    const cameraOffset = this.getInterpolatedCameraOffset(renderBlend, roomContext)
    this.renderTilemaps(cameraOffset, roomContext)
    this.renderSprites(cameraOffset, renderBlend, roomContext)
    if (RENDER_PHYSICS_BOXES) {
      this.renderPhysicsBoxes(cameraOffset, renderBlend, roomContext)
    }
    if (RENDER_COMBAT_BOXES) {
      this.renderCombatBoxes(cameraOffset, renderBlend, roomContext)
    }
  }
  private renderSprites(cameraOffset: Vec2, renderBlend: number, roomContext: RoomContext) {
    for (const [_entityId, components] of this.ecs.getEntitiesInShard(roomContext.shardId).entries()) {
      const spriteComponent = components.SpriteComponent
      if (!spriteComponent) continue
      const positionComponent = assertExists(components.PositionComponent)
      const facing = components.FacingComponent?.value ?? Facing.RIGHT
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)

      // Anchor at entity position in screen space units (before zoom)
      const anchor: Vec2 = vec2.create(
        Math.round(pos[0]!) - Math.round(cameraOffset[0]!),
        Math.round(pos[1]!) - Math.round(cameraOffset[1]!),
      )
      this.drawSpriteAnchored(spriteComponent.spriteFrameDef, anchor, facing, roomContext)

      if (RENDER_ANCHORS) {
        const anchorPx = vec2.elementWiseMultiply(anchor, vec2.create(roomContext.camera.zoom, roomContext.camera.zoom))
        this.drawAnchorCross(anchorPx, this.getDebugColor('white'))
      }
    }
  }
  private renderTilemaps(cameraOffset: Vec2, roomContext: RoomContext) {
    for (const [gridIndex, backgroundTilemapDef] of roomContext.roomDef.backgroundTilemaps.entries()) {
      const tileset = backgroundTilemapDef.tileset
      const grid = roomContext.backgroundGrids[gridIndex]!
      
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
            roomContext.camera.zoom * (tileX * tileset.tileWidth - cameraOffset[0]!),
            roomContext.camera.zoom * (tileY * tileset.tileHeight - cameraOffset[1]!),
            roomContext.camera.zoom * tileset.tileWidth,
            roomContext.camera.zoom * tileset.tileHeight,
          )
        }
      }
    }
  }
  private renderPhysicsBoxes(cameraOffset: Vec2, renderBlend: number, roomContext: RoomContext) {
    for (const [_entityId, components] of this.ecs.getEntitiesInShard(roomContext.shardId).entries()) {
      const physicsBody = components.PhysicsBodyComponent
      const positionComponent = components.PositionComponent
      if (!physicsBody || !positionComponent) continue
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)
      const worldRect = rect.add(physicsBody.rect, pos)
      this.strokeWorldRect(worldRect, cameraOffset, 'red', roomContext)
    }
  }

  private renderCombatBoxes(cameraOffset: Vec2, renderBlend: number, roomContext: RoomContext) {
    for (const [_entityId, components] of this.ecs.getEntitiesInShard(roomContext.shardId).entries()) {
      const positionComponent = components.PositionComponent
      if (!positionComponent) continue
      const pos = this.getInterpolatedPosition(positionComponent, renderBlend)

      const hurt = components.HurtboxComponent
      if (hurt) {
        const worldRect = rect.add(hurt.rect, pos)
        this.strokeWorldRect(worldRect, cameraOffset, `rgba(255,0,255,${hurt.enabled ? 0.9 : 0.5})`, roomContext)
      }
      const hit = components.HitboxComponent
      if (hit) {
        const worldRect = rect.add(hit.rect, pos)
        this.strokeWorldRect(worldRect, cameraOffset, `rgba(0,255,255,${hit.enabled ? 0.9 : 0.5})`, roomContext)
      }
    }
  }

  private getInterpolatedCameraOffset(renderBlend: number, roomContext: RoomContext): Vec2 {
    return vec2.round(DO_INTERPOLATION ? vec2.lerp(roomContext.camera.previousOffset, roomContext.camera.offset, renderBlend) : roomContext.camera.offset)
  }

  private getInterpolatedPosition(positionComponent: PositionComponent, renderBlend: number): Vec2 {
    return vec2.round(DO_INTERPOLATION ? vec2.lerp(positionComponent.previousOffset, positionComponent.offset, renderBlend) : positionComponent.offset)
  }

  private toScreenRect(worldRect: Rect, camOffset: Vec2, roomContext: RoomContext) {
    const z = roomContext.camera.zoom
    const x = z * (worldRect[0]! - camOffset[0]!)
    const y = z * (worldRect[1]! - camOffset[1]!)
    const w = z * (worldRect[2]! - worldRect[0]!)
    const h = z * (worldRect[3]! - worldRect[1]!)
    return { x, y, w, h }
  }

  private strokeWorldRect(worldRect: Rect, camOffset: Vec2, color: string, roomContext: RoomContext) {
    const { x, y, w, h } = this.toScreenRect(worldRect, camOffset, roomContext)
    this.canvas.ctx.strokeStyle = this.getDebugColor(color)
    this.canvas.ctx.lineWidth = 1
    this.canvas.ctx.strokeRect(x, y, w, h)
  }

  // Draw anchored at (anchorX,anchorY). Use transform only for left-facing.
  private drawSpriteAnchored(frameDef: SpriteFrameDef, anchor: Vec2, facing: Facing, roomContext: RoomContext) {
    const img = this.imageLoader.get(frameDef.src)
    const z = roomContext.camera.zoom

    // Dimensions in screen pixels
    const drawW = z * frameDef.w
    const drawH = z * frameDef.h

    // Local offset from the anchor to the sprite's top-left, when facing right
    const localOffsetX = -z * frameDef.offsetX
    const localOffsetY =  z * frameDef.offsetY

    // Anchor in screen pixels
    const anchorPxX = z * anchor[0]!
    const anchorPxY = z * anchor[1]!

    // Screen-space destination (top-left) for the right-facing orientation
    const screenX = anchorPxX + localOffsetX
    const screenY = anchorPxY + localOffsetY

    if (facing === Facing.LEFT) {
      // Draw from pre-flipped spritesheet; adjust source X to mirrored region
      const flipped = this.imageLoader.getFlippedHorizontally(frameDef.src)
      const srcX = flipped.width - (frameDef.x + frameDef.w)
      // Compute the screen top-left so that the anchor remains invariant under mirror about x = anchorX
      const screenXFlipped = 2 * anchorPxX - (screenX + drawW)
      this.canvas.ctx.drawImage(
        flipped,
        srcX,
        frameDef.y,
        frameDef.w,
        frameDef.h,
        screenXFlipped,
        screenY,
        drawW,
        drawH,
      )
    } else {
      this.canvas.ctx.drawImage(
        img,
        frameDef.x,
        frameDef.y,
        frameDef.w,
        frameDef.h,
        screenX,
        screenY,
        drawW,
        drawH,
      )
    }
  }

  // Alternates black on odd ticks; base color on even ticks
  private getDebugColor(baseColor: string): string {
    return (this.frameCounter % 4 < 2) ? 'black' : baseColor
  }

  private drawAnchorCross(anchorPx: Vec2, color: string) {
    const ctx = this.canvas.ctx
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    const size = 3
    const x = anchorPx[0]!
    const y = anchorPx[1]!
    ctx.moveTo(x - size, y - size)
    ctx.lineTo(x + size, y + size)
    ctx.moveTo(x - size, y + size)
    ctx.lineTo(x + size, y - size)
    ctx.stroke()
  }
  dispose() {
  }
}
