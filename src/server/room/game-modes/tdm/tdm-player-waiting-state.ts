import TDMGameStateController from "./tdm-game-state-controller";
import ServerTDMControllerComponent from "./server-tdm-controller-component";
import {TDMPlayingStateController} from "./tdm-playing-state-controller";
import EventEmitter from "src/utils/event-emitter";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import TilemapComponent from "src/physics/tilemap-component";
import PlayerConnectEvent from "src/events/player-connect-event";
import EntityDamageEvent from "src/events/tank-damage-event";
import BlockDamageEvent from "src/events/block-damage-event";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import PlayerDisconnectEvent from "src/events/player-disconnect-event";
import Entity from "src/utils/ecs/entity";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import {TDMGameState, TDMGameStateType} from "src/game-modes/tdm-game-state";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";

export class TDMPlayerWaitingStateController extends TDMGameStateController {

    gameStartTimer: Entity | null = null

    constructor(controller: ServerTDMControllerComponent) {
        super(controller)

        this.worldEventHandler.on("player-respawn", (event) => this.onPlayerRespawn(event))
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnect(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-disconnect", (event) => this.onPlayerDisconnect(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("entity-damage", (event) => this.onEntityDamage(event))
        this.worldEventHandler.on("map-block-damage", (event) => this.onBlockDamage(event))

        this.setupTimer()
    }

    setupTimer() {
        this.gameStartTimer = new Entity()
        ServerEntityPrefabs.types.get(EntityType.TIMER_ENTITY)(this.gameStartTimer)
        this.gameStartTimer.on("timer-finished", () => this.startGame())
    }

    activate() {
        super.activate()
        this.controller.world.appendChild(this.gameStartTimer)
        this.controller.world.getComponent(WorldPlayerStatisticsComponent).resetAllStatistics()

        if(this.haveEnoughPlayers()) {
            this.startTimer()
        }

        this.controller.triggerStateBroadcast()
    }

    deactivate() {
        super.deactivate();
        this.gameStartTimer.removeFromParent()
    }

    private onBlockDamage(event: BlockDamageEvent) {
        // Prevent block damage in the waiting state
        event.cancel()
    }

    private onEntityDamage(event: EntityDamageEvent) {
        // Prevent tank damage in the waiting state
        event.cancel()
    }

    private haveEnoughPlayers() {
        let totalPlayers = this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length
        return totalPlayers >= this.controller.config.minPlayers
    }

    protected onPlayerConnect(event: PlayerConnectEvent) {
        if(event.declined) return

        this.controller.triggerStateBroadcast()
        if(this.haveEnoughPlayers()) {
            this.startTimer()
        }
    }

    private onPlayerDisconnect(event: PlayerDisconnectEvent) {
        this.controller.triggerStateBroadcast()
        if(!this.haveEnoughPlayers()) {
            this.stopTimer()
        }
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        const world = this.controller.getWorld()
        const map = world.getComponent(TilemapComponent).map
        event.respawnPosition = map.spawnPointForTeam(Math.floor(Math.random() * map.spawnZones.length))
    }

    private startTimer() {
        this.gameStartTimer.getComponent(TimerComponent).setTime(this.controller.config.matchStartDelay)
    }

    private stopTimer() {
        this.gameStartTimer.getComponent(TimerComponent).setTime(0)
    }

    private startGame() {
        this.controller.activateController(new TDMPlayingStateController(this.controller))
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.waiting_for_players,
            minPlayers: this.controller.config.minPlayers,
            timer: this.gameStartTimer
        }
    }
}