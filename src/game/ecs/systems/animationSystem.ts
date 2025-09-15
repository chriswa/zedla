import { ECS } from '@/game/ecs/ecs'
import { ITickingSystem } from '@/game/ecs/systems/types'
import { RoomContext } from '@/game/roomContext'
import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { assertExists } from '@/util/assertExists'
import { Disposable, singleton } from 'tsyringe'

@singleton()
export class AnimationSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
  ) {
  }

  tick(roomContext: RoomContext) {
    for (const [_entityId, components] of this.ecs.getEntitiesInScene(roomContext.sceneId).entries()) {
      const animationComponent = components.AnimationComponent
      if (animationComponent !== undefined) {
        const spriteComponent = assertExists(components.SpriteComponent)
        animationComponent.ticksElapsedThisFrame += 1
        if (animationComponent.ticksElapsedThisFrame >= animationComponent.animation.frames[animationComponent.frameIndex]!.duration) {
          animationComponent.ticksElapsedThisFrame = 0
          if (animationComponent.frameIndex < animationComponent.animation.frames.length - 1) {
            animationComponent.frameIndex += 1
          }
          else if (animationComponent.animation.loop) {
            animationComponent.frameIndex = 0
          }
          else {
            // Non-looping animation has reached the end
            animationComponent.hasCompleted = true
          }
          const frameKey = animationComponent.animation.frames[animationComponent.frameIndex]!.spriteFrame
          spriteComponent.spriteFrameDef = spriteFrameDefs[frameKey]
        }
      }
    }
  }

  dispose() {
  }
}
