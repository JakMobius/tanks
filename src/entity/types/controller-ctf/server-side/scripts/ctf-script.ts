import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import Team from "src/server/team";
import Entity from "src/utils/ecs/entity";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import WorldPhysicalLoopComponent from "src/entity/components/world-physical-loop-component";
import PlayerDropFlagEvent from "src/events/player-drop-flag-event";
import {FlagDataComponent} from "src/entity/types/controller-ctf/server-side/scripts/flag-data-component";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import HealthComponent from "src/entity/components/health-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import { chooseRandom } from "src/utils/utils";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import SpawnzoneComponent from "src/entity/types/spawn-zone/spawnzone-component";

export default class CTFScript extends ServerGameScript<ServerCTFControllerComponent> {

    flagEntities: Entity[]
    droppedFlagTimeout: number = 30

    constructor(controller: ServerCTFControllerComponent) {
        super(controller);

        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player))
        this.worldEventHandler.on("player-flag-drop", (player, event) => this.onFlagDrop(event))

        this.flagEntities = this.controller.teams.map((team) => this.createFlagForTeam(team))

        for (let flag of this.flagEntities) {
            flag.on("timer-finished", () => {
                this.returnFlagHome(flag.getComponent(FlagDataComponent), null)
            })
        }
    }

    private createFlagForTeam(team: Team) {
        const flagEntity = new Entity()
        ServerEntityPrefabs.types.get(EntityType.FLAG)(flagEntity)

        const spawnzonesComponent = this.controller.entity.getComponent(GameSpawnzonesComponent)
        const spawnzones = spawnzonesComponent.spawnzones.filter((zone) => {
            let spawnzone = zone.getComponent(SpawnzoneComponent)
            return spawnzone.team === team.id
        })
        const spawnzone = chooseRandom(spawnzones)?.getComponent(SpawnzoneComponent).center() ?? { x: 0, y: 0}

        const flagState = flagEntity.getComponent(FlagDataComponent)
        flagState.basePosition = spawnzone
        flagState.setTeam(team)

        flagEntity.on("flag-contact", (entity) => this.onFlagContact(flagState, entity))

        return flagEntity
    }

    activate() {
        super.activate();

        for (let [, flag] of this.flagEntities.entries()) {
            this.controller.world.appendChild(flag)
            flag.getComponent(FlagDataComponent).returnToBase()
        }
    }

    deactivate() {
        super.deactivate();

        for (let flag of this.flagEntities.values()) {
            flag.removeFromParent()
        }
    }

    private onPlayerDeath(player: Entity) {
        this.dropPlayerFlag(player)
    }

    private onFlagDrop(event: PlayerDropFlagEvent) {
        if (event.cancelled) return
        this.dropPlayerFlag(event.player)
    }

    private onFlagContact(flagState: FlagDataComponent, entity: Entity) {
        if (flagState.carrier) return

        const pilotComponent = entity.getComponent(ServerEntityPilotComponent)
        if (!pilotComponent) return

        const pilot = pilotComponent.pilot
        if (!pilot) return

        const pilotTeam = pilot.getComponent(PlayerTeamComponent).team
        if (!pilotTeam) return

        const healthComponent = entity.getComponent(HealthComponent)
        if (healthComponent && healthComponent.getHealth() <= 0) return

        if (flagState.atBase) {
            if (pilotTeam !== flagState.team) {
                if (!this.getFlagByCarrier(entity)) {
                    this.nextTick(() => this.captureFlag(flagState, entity))
                }
            } else {
                let carriedFlag = this.getFlagByCarrier(entity)
                if (carriedFlag) {
                    this.nextTick(() => this.flagDelivered(carriedFlag, entity))
                }
            }
        } else {
            if (pilotTeam === flagState.team) {
                this.nextTick(() => this.returnFlagHome(flagState, entity))
            } else {
                if (!this.getFlagByCarrier(entity)) {
                    this.nextTick(() => this.captureFlag(flagState, entity))
                }
            }
        }
    }

    private nextTick(callback: () => void) {
        this.controller.world.getComponent(WorldPhysicalLoopComponent).loop.scheduleTask(callback)
    }

    private getFlagByCarrier(carrier: Entity) {
        for (let flag of this.flagEntities) {
            let flagState = flag.getComponent(FlagDataComponent)

            if (flagState.carrier === carrier) return flagState
        }
        return null
    }

    private dropPlayerFlag(player: Entity) {
        let tank = player.getComponent(PlayerTankComponent).tank
        let flag = this.getFlagByCarrier(tank)
        if (flag) {
            this.dropFlag(flag, tank)
        }
    }

    private captureFlag(flagState: FlagDataComponent, tank: Entity) {
        this.controller.world.emit("flag-capture", flagState, tank)
        flagState.entity.getComponent(TimerComponent).countdownFrom(0)
        flagState.captureBy(tank)
    }

    private returnFlagHome(flagState: FlagDataComponent, tank: Entity) {
        this.controller.world.emit("flag-return", flagState, tank)
        flagState.entity.getComponent(TimerComponent).countdownFrom(0)
        flagState.returnToBase()
    }

    private dropFlag(flagState: FlagDataComponent, tank: Entity) {
        this.controller.world.emit("flag-drop", flagState, tank)
        flagState.entity.getComponent(TimerComponent).countdownFrom(this.droppedFlagTimeout)
        flagState.drop()
    }

    private flagDelivered(flagState: FlagDataComponent, tank: Entity) {
        this.controller.world.emit("flag-delivery", flagState, tank)
        flagState.returnToBase()
    }
}