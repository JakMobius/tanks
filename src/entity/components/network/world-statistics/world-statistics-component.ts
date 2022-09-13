import {Component} from "../../../../utils/ecs/component";
import Entity from "../../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../../utils/basic-event-handler-set";
import {TransmitterSet} from "../transmitting/transmitter-set";
import WorldStatisticsTransmitter from "./world-statistics-transmitter";
import TimerComponent from "../timer/timer-component";

export interface PlayerStatistics {
    name: string
    teamId: number
    score: number
    kills: number
    deaths: number
}

export interface TeamStatistics {
    score: number
}

export default class WorldStatisticsComponent implements Component {
    entity: Entity | null

    playerStatistics: PlayerStatistics[] = []
    mapName: string | null = null
    matchTimeLeftTimer?: Entity | null = null

    eventListener = new BasicEventHandlerSet()

    constructor() {
        this.eventListener.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(WorldStatisticsTransmitter)
        })
    }

    setMapName(mapName?: string) {
        this.mapName = mapName
        if(this.entity) this.entity.emit("map-name-updated")
    }

    setPlayerStatistics(playerStatistics: PlayerStatistics[]) {
        this.playerStatistics = playerStatistics
        if(this.entity) this.entity.emit("player-statistics-updated")
    }

    setMatchLeftTimer(timer: Entity) {
        this.matchTimeLeftTimer = timer
        this.entity.emit("match-timer-set")
    }

    getMatchLeftTimerComponent() {
        if(!this.matchTimeLeftTimer) return null
        return this.matchTimeLeftTimer.getComponent(TimerComponent)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventListener.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventListener.setTarget(null)
    }
}