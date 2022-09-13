import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {GameSocketPortalClient} from "src/server/socket/game-server/game-socket-portal";
import Player from "src/server/player";
import PlayerConnectionManager from "src/server/player-connection-manager";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import {Component} from "src/utils/ecs/component";
import GameModeEventTransmitter from "src/entity/components/network/game-mode/game-mode-event-transmitter";
import {TDMPlayerWaitingStateController} from "./tdm-player-waiting-state";
import TDMGameStateController from "./tdm-game-state-controller";
import PlayerConnectEvent from "src/events/player-connect-event";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import Team from "src/server/team";
import EventEmitter from "src/utils/event-emitter";
import ServerGameController from "../server-game-controller";

export interface TDMConfig {
    minPlayers?: number
    teams?: number
    matchTime?: number
    singleTeamMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerTDMControllerComponent implements Component, ServerGameController {
    entity: Entity | null
    world: Entity | null = null

    entityEventHandler = new BasicEventHandlerSet()
    worldEventHandler = new BasicEventHandlerSet()

    config: Required<TDMConfig>
    activeController: TDMGameStateController | null = null
    teams: Team[] = []
    private needsBroadcast = false

    constructor(config?: TDMConfig) {
        this.config = Object.assign({
            minPlayers: 4,
            teams: 2,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singleTeamMatchTime: 15
        }, config)

        this.entityEventHandler.on("attached-to-parent", (child, parent) => {
            if (child === this.entity) this.setWorld(parent)
        })

        this.entityEventHandler.on("detached-from-parent", (child, parent) => {
            if (child === this.entity) this.setWorld(null)
        })

        this.entityEventHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(GameModeEventTransmitter, this)
        })

        this.entityEventHandler.on("tick", () => {
            if (this.needsBroadcast) {
                this.needsBroadcast = false
                this.entity.emit("state-broadcast")
            }
        })

        this.worldEventHandler.on("client-connect", (client) => this.onClientConnected(client))
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnect(event), EventEmitter.PRIORITY_MONITOR)

        this.createTeams()
    }

    activateController(controller: TDMGameStateController) {
        if (this.activeController) {
            this.activeController.deactivate()
        }

        this.activeController = controller

        if(this.activeController) {
            this.activeController.activate()
        }

        this.triggerStateBroadcast()
    }

    public leastPopulatedTeam() {
        let leastPopulatedTeam = null
        let leastPopulatedCount = Infinity
        for(let team of this.teams) {
            if(team.players.length < leastPopulatedCount) {
                leastPopulatedTeam = team
                leastPopulatedCount = team.players.length
            }
        }
        return leastPopulatedTeam
    }

    protected onClientConnected(client: GameSocketPortalClient) {
        let player = new Player({
            nick: client.data.name
        })

        PlayerConnectionManager.attach(player, client)
        let declineReason = player.connectToWorld(this.world)
        if(declineReason) {
            client.connection.close(declineReason.message ?? "You can't join this room")
        }
    }

    protected onPlayerConnect(event: PlayerConnectEvent) {
        if(event.declined) return
        this.spawnPlayer(event.player)
    }

    private spawnPlayer(player: Player) {
        let world = this.getWorld()

        const tank = new Entity()
        ServerEntityPrefabs.types.get(EntityType.TANK_MONSTER)(tank)
        world.appendChild(tank)

        player.setTank(tank)
        player.respawn()
    }

    triggerStateBroadcast() {
        // Important note: state broadcast cannot be triggered synchronously from
        // such events as transmitter-set-attached, because game state might
        // contain some entities that are not yet visible to the client. Thus,
        // we need to wait for the next tick to trigger state broadcast.

        this.needsBroadcast = true
    }

    getWorld() {
        return this.world
    }

    setWorld(world: Entity) {
        this.activateController(null)

        this.world = world

        if (this.world) {
            this.activateController(new TDMPlayerWaitingStateController(this))
        }

        this.worldEventHandler.setTarget(world)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.entityEventHandler.setTarget(this.entity)
        this.setWorld(entity.parent)
    }

    onDetach(): void {
        this.entity = null
        this.entityEventHandler.setTarget(null)
        this.setWorld(null)
    }

    private createTeams() {
        for (let i = 0; i < this.config.teams; i++) {
            let team = new Team()
            team.id = i
            this.teams.push(team)
        }
    }
}