import {Commands} from "../network/commands";
import ReceiverComponent from "../network/receiving/receiver-component";
import EntityDataReceiveComponent from "../network/receiving/entity-data-receive-component";
import WorldStatisticsComponent from "./world-statistics-component";

export default class WorldStatisticsReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.WORLD_PLAYER_STATISTICS_COMMAND, (buffer) => {
            this.getWorldStatistics().setPlayerStatistics(receiveComponent.readObject(buffer))
        })

        receiveComponent.commandHandlers.set(Commands.WORLD_MAP_NAME_COMMAND, (buffer) => {
            this.getWorldStatistics().setMapName(buffer.readString())
        })

        receiveComponent.commandHandlers.set(Commands.WORLD_MATCH_TIMER_COMMAND, (buffer) => {
            this.getWorldStatistics().setMatchLeftTimer(receiveComponent.readEntity(buffer))
        })
    }

    private getWorldStatistics() {
        return this.entity.getComponent(WorldStatisticsComponent)
    }
}