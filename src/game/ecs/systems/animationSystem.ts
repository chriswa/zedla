import { singleton, type Disposable } from "tsyringe";

import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import { RoomContext } from "@/game/roomContext";
import { spriteFrameDefs } from "@/resources/spriteFrameDefs";
import { assertExists } from "@/util/assertExists";

@singleton()
export class AnimationSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
  ) {
  }
  tick(_roomContext: RoomContext) {
    for (const [_entityId, components] of this.ecs.entities.entries()) {
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
