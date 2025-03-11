import Transmitter from "../network/transmitting/transmitter";
import {Commands} from "../network/commands";
import WorldStatisticsComponent from "./world-statistics-component";
import TransmitterVisibilityPrecondition from "../network/transmitting/precondition/transmitter-visibility-precondition";

export default class WorldStatisticsTransmitter extends Transmitter {
    private visibilityPrecondition = new TransmitterVisibilityPrecondition(this)

    constructor() {
        super()

        this.eventHandler.on("player-statistics-updated", () => this.sendPlayerStatistics())
        this.eventHandler.on("map-name-updated", () => this.sendMapName())
        this.eventHandler.on("match-timer-set", () => {
            this.updatePrecondition()
            this.sendTimer()
        })

        this.transmitterPrecondition = this.visibilityPrecondition
    }

    private sendMapName() {
        let name = this.getWorldStatistics().mapName
        if(!name) return
        
        this.packIfEnabled(Commands.WORLD_MAP_NAME_COMMAND, (buffer) => {
            buffer.writeString(name)
        })
    }

    private sendTimer() {
        let timer = this.getWorldStatistics().matchTimeLeftTimer
        if(!timer) return

        this.packIfEnabled(Commands.WORLD_MATCH_TIMER_COMMAND, (buffer) => {
            this.pointToEntity(timer)
        })
    }

    private sendPlayerStatistics() {
        this.packIfEnabled(Commands.WORLD_PLAYER_STATISTICS_COMMAND, (buffer) => {
            this.encodeObject(this.getWorldStatistics().playerStatistics)
        })
    }

    updatePrecondition() {
        let timer = this.getWorldStatistics().matchTimeLeftTimer
        if(!timer) this.visibilityPrecondition.setEntityArray([])
        else this.visibilityPrecondition.setEntityArray([timer])
    }

    onEnable() {
        super.onEnable();
        this.sendPlayerStatistics()
        this.sendMapName()
        this.sendTimer()
    }

    private getWorldStatistics() {
        return this.getEntity().getComponent(WorldStatisticsComponent)
    }
}