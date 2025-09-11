import { animationDefs } from "@/resources/animationDefs";
import { spriteFrameDefs } from "@/resources/spriteFrameDefs";
import { AnimationComponent, SpriteComponent } from "../ecs/components";
import { ECS } from "../ecs/ecs";
import type { EntityId } from "../ecs/ecs";
import type { AnimationDef } from "@/types/animationDef";
import { assertExists } from "@/util/assertExists";
import { hasFrameFlag, type AnimationFrameFlag } from "@/types/animationFlags";

type CharacterKey = keyof typeof animationDefs
type AnimationName<K extends CharacterKey> = keyof typeof animationDefs[K]


export class AnimationController<K extends CharacterKey> {
  private cachedAnimationDefMap: Record<AnimationName<K>, AnimationDef>
  constructor(private characterKey: K) {
    this.cachedAnimationDefMap = animationDefs[this.characterKey] as Record<AnimationName<K>, AnimationDef>
  }


  // Adds both SpriteComponent and AnimationComponent, initialized to the first frame
  addSpriteAndAnimationComponents(ecs: ECS, entityId: EntityId, initialAnimationName: AnimationName<K>) {
    const animDef = this.cachedAnimationDefMap[initialAnimationName]
    const firstFrameKey = animDef.frames[0]!.spriteFrame
    ecs.addComponent(entityId, 'SpriteComponent', new SpriteComponent(spriteFrameDefs[firstFrameKey]))
    ecs.addComponent(entityId, 'AnimationComponent', new AnimationComponent(animationDefs[this.characterKey], animDef))
  }

  // Switch to a new animation; resets indices and updates the current sprite frame immediately
  startAnimation(ecs: ECS, entityId: EntityId, animationName: AnimationName<K>) {
    const animationComponent = assertExists(ecs.getComponent(entityId, 'AnimationComponent'))
    animationComponent.frameIndex = 0
    animationComponent.ticksElapsedThisFrame = 0
    animationComponent.hasCompleted = false
    animationComponent.animation = this.cachedAnimationDefMap[animationName]

    const firstFrameKey = animationComponent.animation.frames[0]!.spriteFrame
    const spriteComponent = assertExists(ecs.getComponent(entityId, 'SpriteComponent'))
    spriteComponent.spriteFrameDef = spriteFrameDefs[firstFrameKey]
  }
  playAnimation(ecs: ECS, entityId: EntityId, animationName: AnimationName<K>) {
    const animationComponent = assertExists(ecs.getComponent(entityId, 'AnimationComponent'))
    if (animationComponent.animation !== this.cachedAnimationDefMap[animationName]) {
      this.startAnimation(ecs, entityId, animationName)
    }
  }

  hasCurrentFrameFlag(ecs: ECS, entityId: EntityId, flag: AnimationFrameFlag): boolean {
    const animationComponent = assertExists(ecs.getComponent(entityId, 'AnimationComponent'))
    const curFrame = animationComponent.animation.frames[animationComponent.frameIndex]!
    return hasFrameFlag(curFrame.flags, flag)
  }

  isCompleted(ecs: ECS, entityId: EntityId): boolean {
    const animationComponent = assertExists(ecs.getComponent(entityId, 'AnimationComponent'))
    return animationComponent.hasCompleted
  }
}
