import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import Transmitter from "../network/transmitting/transmitter";
import { Commands } from "../network/commands";

export default class EntityPilotTransmitter extends Transmitter {
    constructor() {
        super();

        this.eventHandler.on("pilot-set", () => this.updatePilot())
        this.eventHandler.on("pilot-team-set", () => this.updatePilot())
    }

    onEnable() {
        super.onEnable()
        this.updatePilot()
    }

    private updatePilot() {
        let player = this.getEntity().getComponent(ServerEntityPilotComponent).pilot

        this.packIfEnabled(Commands.ENTITY_PILOT_LIST_COMMAND, (buffer) => {
            let nick = player?.getComponent(PlayerNickComponent).nick
            if(nick) {
                buffer.writeInt8(1)
                let nick = player.getComponent(PlayerNickComponent).nick
                buffer.writeString(nick)
                let team = player.getComponent(PlayerTeamComponent).team
                if (team) {
                    buffer.writeInt16(team.id)
                } else {
                    buffer.writeInt16(-1)
                }
            } else {
                buffer.writeInt8(0)
            }
        })
    }
}