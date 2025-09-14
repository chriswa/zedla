import { singleton, type Disposable } from "tsyringe";

import { agentKindRegistry } from "../../agent/agentKindRegistry";
import { GameEventBus } from "../../event/gameEventBus";
import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import type { AgentKindComponent } from "../components";

import { RoomContext } from "@/game/roomContext";



@singleton()
export class AgentSystem implements ITickingSystem, Disposable {
  private unsubscribeFromEvents: () => void

  constructor(
    private ecs: ECS,
    private gameEventBus: GameEventBus,
  ) {
    this.unsubscribeFromEvents = this.gameEventBus.on('ecs:component_removing', (entityId, componentKey, component) => {
      if (componentKey === 'AgentKindComponent') {
        const agentKindComponent = component as AgentKindComponent
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.onDestroy(entityId)
      }
    })
  }

  tick(roomContext: RoomContext) {
    for (const [entityId, components] of this.ecs.getEntitiesInShard(roomContext.shardId).entries()) {
      const agentKindComponent = components.AgentKindComponent
      if (agentKindComponent) {
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.tick(entityId, components, roomContext)
      }
    }
  }

  dispose() {
    this.unsubscribeFromEvents()
  }
}
