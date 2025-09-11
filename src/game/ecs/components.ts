import type { AgentKindKey } from "../agent/agentKindRegistry";
import type { Rect } from "@/math/rect";
import type { Vec2 } from "@/math/vec2";
import type { animationDefs } from "@/resources/animationDefs";
import type { AnimationDef } from "@/types/animationDef";
import type { SpriteFrameDef } from "@/types/spriteFrameDef";
import type { Facing } from "@/types/facing";
import type { CombatMask } from "@/types/combat";
import type { EntityMail } from "@/types/entityMail";

import { vec2 } from "@/math/vec2";

export class PositionComponent {
  public previousOffset: Vec2
  constructor(
    public offset: Vec2,
  ) {
    this.previousOffset = vec2.clone(offset)
  }
}
export class PhysicsBodyComponent {
  public touchingLeft = false
  public touchingRight = false
  public touchingUp = false
  public touchingDown = false

  constructor(
    public rect: Rect,
    public velocity: Vec2,
    public acceleration: Vec2 = vec2.zero(),
  ) {}
}
export class SpriteComponent {
  constructor(
    public spriteFrameDef: SpriteFrameDef,
  ) {}
}
export class FacingComponent {
  constructor(
    public value: Facing,
  ) {}
}
export class AnimationComponent {
  public frameIndex = 0
  public ticksElapsedThisFrame = 0
  public hasCompleted = false
  constructor(
    public character: typeof animationDefs[keyof typeof animationDefs],
    public animation: AnimationDef,
  ) {}
}

export class AgentKindComponent {
  constructor(
    public kind: AgentKindKey,
  ) {}
}

export class HitboxComponent {
  public enabled: boolean = true
  constructor(
    public rect: Rect,
    public mask: CombatMask,
  ) {}
}

export class HurtboxComponent {
  constructor(
    public rect: Rect,
    public mask: CombatMask,
    public enabled: boolean = true,
  ) {}
}

export class MailboxComponent {
  public eventQueue: EntityMail[] = []
}

export type ComponentKey = keyof typeof componentRegistry

// TODO: auto-generate this object with barrelsby/ts-intern
export const componentRegistry = {
  PositionComponent,
  PhysicsBodyComponent,
  SpriteComponent,
  FacingComponent,
  HitboxComponent,
  HurtboxComponent,
  MailboxComponent,
  AnimationComponent,
  AgentKindComponent,
} as const
