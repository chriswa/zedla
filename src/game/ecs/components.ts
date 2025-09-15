import { AgentKindKey } from '@/game/agent/agentKindRegistry'
import { Rect } from '@/math/rect'
import { Vec2, vec2 } from '@/math/vec2'
import { animationDefs } from '@/resources/animationDefs'
import { AnimationDef } from '@/types/animationDef'
import { CombatMask } from '@/types/combat'
import { EntityMail } from '@/types/entityMail'
import { Facing } from '@/types/facing'
import { SpriteFrameDef } from '@/types/spriteFrameDef'

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
  ) {}
}
export class SpriteComponent {
  constructor(
    public spriteFrameDef: SpriteFrameDef,
    public zIndex: number,
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
  public enabled = true
  constructor(
    public rect: Rect,
    public mask: CombatMask,
  ) {}
}

export class HurtboxComponent {
  constructor(
    public rect: Rect,
    public mask: CombatMask,
    public enabled = true,
  ) {}
}

export class MailboxComponent {
  public eventQueue: Array<EntityMail> = []
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
