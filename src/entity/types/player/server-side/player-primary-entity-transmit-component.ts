import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PrimaryEntityTransmitter from "src/entity/components/network/primary-player/primary-entity-transmitter";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";

export default class PlayerPrimaryEntityTransmitComponent extends EventHandlerComponent {

    private primaryPlayerTransmitter = new PrimaryEntityTransmitter()

    constructor() {
        super();
        this.eventHandler.on("tank-set", () => {
            let tank = this.entity.getComponent(PlayerTankComponent).tank
            this.primaryPlayerTransmitter.setEntity(tank)
        })

        this.eventHandler.on("world-set", () => {
            const connectionManager = this.entity.getComponent(PlayerConnectionManagerComponent)
            const worldTransmitter = connectionManager.getWorldTransmitterSet()

            if(worldTransmitter) {
                worldTransmitter.attachTransmitter(this.primaryPlayerTransmitter)
            }
        })
    }
}