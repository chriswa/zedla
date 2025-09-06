import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import { Input, Button } from "@/app/input";
import { RoomContext } from "@/game/roomContext";
import { GRAVITY } from "./physicsSystem";

const PLAYER_SPEED = 120

@scoped(Lifecycle.ContainerScoped)
export class PlayerSystem implements ITickingSystem, Disposable {
  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
    private input: Input,
  ) {
  }
  tick() {
    const playerEntityId = this.roomContext.playerEntityId
    const physicsBody = this.ecs.getComponent(playerEntityId, 'PhysicsBodyComponent')
    
    if (physicsBody) {
      physicsBody.velocity[0] = 0

      physicsBody.velocity[1]! += GRAVITY / 60
      
      if (this.input.isDown(Button.LEFT) && !this.input.isDown(Button.RIGHT)) {
        physicsBody.velocity[0] = -PLAYER_SPEED
      } else if (this.input.isDown(Button.RIGHT) && !this.input.isDown(Button.LEFT)) {
        physicsBody.velocity[0] = PLAYER_SPEED
      }
    }
  }
  dispose() {
  }
}
