import Transmitter from "src/entity/components/network/transmitting/transmitter"
import { FlagStateComponent } from "./flag-state-component"
import { Commands } from "src/entity/components/network/commands"


export default class FlagStateTransmitter extends Transmitter {
    constructor() {
        super()
        this.eventHandler.on("team-set", (entity) => {
            this.sendTeam()
        })
    }

    onEnable(): void {
        super.onEnable()
        this.sendTeam()
    }

    sendTeam() {
        const flagData = this.getEntity().getComponent(FlagStateComponent)

        this.packIfEnabled(Commands.FLAG_DATA_COMMAND, (buffer) => {
            buffer.writeInt8(flagData.team.id)
        })
    }
}
