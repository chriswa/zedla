import type { Rect } from "@/math/rect";
import type { Vec2 } from "@/math/vec2";
import { vec2 } from "@/math/vec2";
import type { animationDefs } from "@/resources/animationDefs";
import type { AnimationDef } from "@/types/animationDef";
import type { ImageSliceDef } from "@/types/imageSliceDef";

export class PositionComponent {
  public previousOffset: Vec2
  constructor(
    public offset: Vec2,
  ) {
    this.previousOffset = vec2.clone(offset)
  }
}
export class PhysicsBodyComponent {
  constructor(
    public rect: Rect,
    public velocity: Vec2,
  ) {}
}
export class SpriteComponent {
  constructor(
    public frameDef: ImageSliceDef,
  ) {}
}
export class AnimationComponent {
  public frameIndex = 0
  public ticksElapsedThisFrame = 0
  constructor(
    public character: typeof animationDefs[keyof typeof animationDefs],
    public animation: AnimationDef,
  ) {}
}

export type ComponentKey = keyof typeof componentRegistry

// TODO: auto-generate this object with barrelsby/ts-intern
export const componentRegistry = {
  PositionComponent,
  PhysicsBodyComponent,
  SpriteComponent,
  AnimationComponent,
} as const
