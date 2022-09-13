
import Transmitter from "../transmitting/transmitter";
import {Commands} from "../commands";
import ServerEntityPilotListComponent from "../../../../server/entity/components/server-entity-pilot-list-component";

export default class EntityPilotListTransmitter extends Transmitter {
    constructor() {
        super();

        this.eventHandler.on("pilot-add", () => {
            this.updatePilotList()
        })

        this.eventHandler.on("pilot-remove", () => {
            this.updatePilotList()
        })

        this.eventHandler.on("pilot-team-set", () => {
            this.updatePilotList()
        })
    }

    onEnable() {
        super.onEnable()
        this.updatePilotList()
    }

    private updatePilotList() {
        let playerList = this.getEntity().getComponent(ServerEntityPilotListComponent).players

        this.packIfEnabled(Commands.ENTITY_PILOT_LIST_COMMAND, (buffer) => {
            buffer.writeUint16(playerList.length)
            for (let player of playerList) {
                buffer.writeString(player.nick)

                if(player.team) {
                    buffer.writeInt16(player.team.id)
                } else {
                    buffer.writeInt16(-1)
                }
            }
        })
    }
}