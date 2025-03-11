import Entity from "src/utils/ecs/entity";
import {TransmitterSet} from "../network/transmitting/transmitter-set";
import WorldStatisticsTransmitter from "./world-statistics-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TimerComponent from "src/entity/types/timer/timer-component";

export interface PlayerStatistics {
    name: string
    teamId: number
    score: number
    kills: number
    deaths: number
}

export default class WorldStatisticsComponent extends EventHandlerComponent {

    playerStatistics: PlayerStatistics[] = []
    mapName: string | null = null
    matchTimeLeftTimer?: Entity | null = null

    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
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
}