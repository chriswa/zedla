import { AnimationComponent, SpriteComponent } from '@/game/ecs/components'
import { ECS, EntityId } from '@/game/ecs/ecs'
import { animationDefs } from '@/resources/animationDefs'
import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { AnimationDef } from '@/types/animationDef'
import { AnimationFrameFlag, hasFrameFlag } from '@/types/animationFlags'

type CharacterKey = keyof typeof animationDefs
type AnimationName<K extends CharacterKey> = keyof typeof animationDefs[K]

export class AnimationBehavior<K extends CharacterKey> {
  constructor(
    private characterKey: K,
  ) {
  }

  private getAnimationDef(animationName: AnimationName<K>): AnimationDef {
    return animationDefs[this.characterKey][animationName] as AnimationDef
  }

  // Adds both SpriteComponent and AnimationComponent, initialized to the first frame
  addSpriteAndAnimationComponents(ecs: ECS, entityId: EntityId, initialAnimationName: AnimationName<K>, zIndex: number) {
    const animDef = this.getAnimationDef(initialAnimationName)
    const firstFrameKey = animDef.frames[0]!.spriteFrame
    ecs.addComponent(entityId, 'SpriteComponent', new SpriteComponent(spriteFrameDefs[firstFrameKey], zIndex))
    ecs.addComponent(entityId, 'AnimationComponent', new AnimationComponent(animationDefs[this.characterKey], animDef))
  }

  // Switch to a new animation; resets indices and updates the current sprite frame immediately
  startAnimation(ecs: ECS, entityId: EntityId, animationName: AnimationName<K>) {
    const animationComponent = ecs.getComponent(entityId, 'AnimationComponent')
    animationComponent.frameIndex = 0
    animationComponent.ticksElapsedThisFrame = 0
    animationComponent.hasCompleted = false
    animationComponent.animation = this.getAnimationDef(animationName)

    const firstFrameKey = animationComponent.animation.frames[0]!.spriteFrame
    const spriteComponent = ecs.getComponent(entityId, 'SpriteComponent')
    spriteComponent.spriteFrameDef = spriteFrameDefs[firstFrameKey]
  }

  playAnimation(ecs: ECS, entityId: EntityId, animationName: AnimationName<K>) {
    const animationComponent = ecs.getComponent(entityId, 'AnimationComponent')
    if (animationComponent.animation !== this.getAnimationDef(animationName)) {
      this.startAnimation(ecs, entityId, animationName)
    }
  }

  hasCurrentFrameFlag(ecs: ECS, entityId: EntityId, flag: AnimationFrameFlag): boolean {
    const animationComponent = ecs.getComponent(entityId, 'AnimationComponent')
    const curFrame = animationComponent.animation.frames[animationComponent.frameIndex]!
    return hasFrameFlag(curFrame.flags, flag)
  }

  isCompleted(ecs: ECS, entityId: EntityId): boolean {
    const animationComponent = ecs.getComponent(entityId, 'AnimationComponent')
    return animationComponent.hasCompleted
  }
}
