import { container, type DependencyContainer } from "tsyringe";
import type { Game } from "../game"
import { GameStrategy } from "../gameStrategy"
import { RoomDefToken, type RoomDef } from "@/types/roomDef"
import { RoomSimulation } from "./roomSimulation";
import { assertExists } from "@/util/assertExists";

export class RoomGameStrategy extends GameStrategy { // a.k.a. RoomOrchestrator
  private roomSimulation: RoomSimulation | undefined
  private childContainer: DependencyContainer | undefined
  constructor(
    private game: Game,
    private roomDef: RoomDef,
  ) {
    super()
  }
  override start() {
    this.childContainer = container.createChildContainer()
    this.childContainer.registerInstance<RoomDef>(RoomDefToken, this.roomDef) // or RoomState
    this.roomSimulation = this.childContainer.resolve(RoomSimulation)
  }
  override tick() {
    assertExists(this.roomSimulation).tick()
  }
  override stop() {
    assertExists(this.childContainer).dispose()
  }
}

// function createTilemapsFromBackgroundTilemapDefs(backgroundTilemapDefs: Array<BackgroundTilemapDef>): Array<Tilemap> {
//   let index = 0
//   return backgroundTilemapDefs.map(backgroundTilemapDef => new Tilemap(
//     backgroundTilemapDef.tileset,
//     vec3.create(0, 0, --index), // put behind sprites
//     backgroundTilemapDef.cols,
//     backgroundTilemapDef.tiles,
//   ))
// }

// function spawnRoomEntity(roomEntityDef: RoomEntityDef, ...injectedArgs: RoomEntityInjectedArgs) {
//   const Ctor = entityKinds[roomEntityDef.kind]
//   return new Ctor(...injectedArgs, ...roomEntityDef.args)
// }
