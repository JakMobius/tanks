import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import WorldStatisticsComponent, {
    PlayerStatistics
} from "src/entity/components/network/world-statistics/world-statistics-component";
import DamageRecorderComponent from "./damage-recorder-component";
import EventEmitter from "src/utils/event-emitter";
import ServerWorldPlayerManagerComponent from "./server-world-player-manager-component";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";

export default class WorldPlayerStatisticsComponent implements Component {
    entity: Entity | null
    worldEventHandler = new BasicEventHandlerSet()
    needsSerialize = true

    playerStatistics = new Map<Entity, PlayerStatistics>()

    constructor() {
        this.worldEventHandler.on("player-connect", (player) => this.onPlayerConnect(player))
        this.worldEventHandler.on("player-disconnect", (player) => this.onPlayerDisconnect(player))
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

    private onPlayerConnect(player: Entity) {
        this.resetStatistics(player)
    }

    private onPlayerDisconnect(player: Entity) {
        this.playerStatistics.delete(player)
        this.markUpdated()
    }

    private onPlayerTeamSet(player: Entity) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)

        let statistics = this.playerStatistics.get(player)
        if(!statistics) return

        statistics.teamId = playerTeamComponent.team ? playerTeamComponent.team.id : -1
        this.markUpdated()
    }

    private onPlayerDeath(player: Entity) {
        let damageRecorder = this.entity.getComponent(DamageRecorderComponent)
        if(damageRecorder) {
            let damager = damageRecorder.getDamageData(player).damagers[0]
            if(damager && damager != player) {
                let statistics = this.playerStatistics.get(damager)
                // The player could have left the game
                if(statistics) {
                    statistics.kills++
                }
            }
        }

        this.playerStatistics.get(player).deaths++
        this.markUpdated()
    }

    resetStatistics(player: Entity) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)

        this.playerStatistics.set(player, {
            name: player.getComponent(PlayerNickComponent).nick,
            kills: 0,
            deaths: 0,
            score: 0,
            teamId: playerTeamComponent.team ? playerTeamComponent.team.id : -1
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

    scorePlayer(killer: Entity, score: number) {
        let playerStatistics = this.playerStatistics.get(killer)

        if(playerStatistics) {
            playerStatistics.score += score
            this.markUpdated()
        }
    }
}