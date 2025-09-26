import { CanvasLog } from '@/dev/canvasLog'
import { IAgentKind } from '@/game/agent/agentKind'
import { PlayerMovementBehavior } from '@/game/agent/behaviors/playerMovementBehavior'
import { PlayerAnimationBehavior } from '@/game/agent/kinds/player/playerAnimationBehavior'
import { PlayerFsmStrategy, resolvePlayerStrategy } from '@/game/agent/kinds/player/playerStrategyRegistry'
import { FacingComponent, HitboxComponent, HurtboxComponent, InvulnerabilityComponent, PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { EntityDataManager } from '@/game/ecs/entityDataManager'
import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { CombatBit, createCombatMask } from '@/types/combat'
import { Facing } from '@/types/facing'
import { Fsm } from '@/util/fsm'
import { singleton } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PlayerSpawnData {
}

interface PlayerEntityData {
  fsm: Fsm<PlayerFsmStrategy>
}

@singleton()
class PlayerEntityDataManager extends EntityDataManager<PlayerEntityData> {}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    private playerEntityDataManager: PlayerEntityDataManager,
    private playerMovementBehavior: PlayerMovementBehavior,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private canvasLog: CanvasLog,
  ) {}

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    console.log('PlayerAgentKind ECS:', this.ecs)
    console.log('Entity exists:', this.ecs.entities.has(entityId))
    this.playerAnimationBehavior.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand', 1)
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.zero(), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))
    this.ecs.addComponent(entityId, 'InvulnerabilityComponent', new InvulnerabilityComponent())

    // Initialize movement data
    this.playerMovementBehavior.createMovementData(entityId)

    // Initialize player data with FSM
    const fsm = new Fsm(resolvePlayerStrategy('GroundedStrategy'), resolvePlayerStrategy)
    this.playerEntityDataManager.onCreate(entityId, {
      fsm: fsm,
    })
  }

  tick(entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    const data = this.playerEntityDataManager.get(entityId)
    data.fsm.process(entityId)

    const physics = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    this.canvasLog.upsertPermanent('player-velocity', `player velocity: ${(physics.velocity[0] ?? 0).toFixed(3)}, ${(physics.velocity[1] ?? 0).toFixed(3)}`, 0)
  }

  onDestroy(entityId: EntityId): void {
    this.playerMovementBehavior.destroyMovementData(entityId)
    this.playerEntityDataManager.onDestroy(entityId)
  }
}
