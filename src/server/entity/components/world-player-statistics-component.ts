import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import WorldStatisticsComponent, {
    PlayerStatistics, TeamStatistics
} from "../../../entity/components/network/world-statistics/world-statistics-component";
import DamageRecorderComponent from "./damage-recorder-component";
import EventEmitter from "../../../utils/event-emitter";
import ServerWorldPlayerManagerComponent from "./server-world-player-manager-component";
import Player from "../../player";
import PlayerConnectEvent from "../../../events/player-connect-event";
import PlayerDisconnectEvent from "../../../events/player-disconnect-event";

export default class WorldPlayerStatisticsComponent implements Component {
    entity: Entity | null
    worldEventHandler = new BasicEventHandlerSet()
    needsSerialize = true

    playerStatistics = new Map<Player, PlayerStatistics>()

    constructor() {
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnect(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-disconnect", (event) => this.onPlayerDisconnect(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-team-set", (player) => this.onPlayerTeamSet(player))
        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("tick", () => {
            if(this.needsSerialize) {
                this.serialize()
                this.needsSerialize = false
            }
        })
    }

    serialize() {
        if(!this.entity) return

        let statisticsComponent = this.entity.getComponent(WorldStatisticsComponent)
        statisticsComponent.setPlayerStatistics(Array.from(this.playerStatistics.values()))
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.worldEventHandler.setTarget(this.entity)
        this.resetAllStatistics()
        this.needsSerialize = true
    }

    onDetach(): void {
        this.entity = null
        this.worldEventHandler.setTarget(null)
        this.resetAllStatistics()
    }

    private onPlayerConnect(event: PlayerConnectEvent) {
        if(event.declined) return
        this.resetStatistics(event.player)
    }

    private onPlayerDisconnect(event: PlayerDisconnectEvent) {
        this.playerStatistics.delete(event.player)
        this.markUpdated()
    }

    private onPlayerTeamSet(player: Player) {
        let statistics = this.playerStatistics.get(player)
        if(!statistics) return
        statistics.teamId = player.team ? player.team.id : -1
        this.markUpdated()
    }

    private onPlayerDeath(player: Player) {
        let damageRecorder = this.entity.getComponent(DamageRecorderComponent)
        if(damageRecorder) {
            let damager = damageRecorder.getDamageData(player).damagers[0]
            if(damager && damager != player) {
                this.playerStatistics.get(damager).kills++
            }
        }

        this.playerStatistics.get(player).deaths++
        this.markUpdated()
    }

    resetStatistics(player: Player) {
        this.playerStatistics.set(player, {
            name: player.nick,
            kills: 0,
            deaths: 0,
            score: 0,
            teamId: player.team ? player.team.id : -1
        })
        this.markUpdated()
    }

    resetAllStatistics() {
        this.playerStatistics.clear()
        if(!this.entity) return

        let playerManagerComponent = this.entity.getComponent(ServerWorldPlayerManagerComponent)
        for(let player of playerManagerComponent.players) {
            this.resetStatistics(player)
        }
    }

    markUpdated() {
        this.needsSerialize = true
    }

    scorePlayer(killer: Player, score: number) {
        let playerStatistics = this.playerStatistics.get(killer)

        if(playerStatistics) {
            playerStatistics.score += score
            this.markUpdated()
        }
    }
}