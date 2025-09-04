import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { RoomContext } from "@/game/roomContext";
import { Input, Button } from "@/app/input";

const PLAYER_SPEED = 120

@scoped(Lifecycle.ContainerScoped)
export class PlayerSystem implements ISystem, Disposable {
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
