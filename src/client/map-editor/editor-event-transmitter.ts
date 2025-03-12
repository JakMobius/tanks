
import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import { TransmitterSet } from "src/entity/components/network/transmitting/transmitter-set";

export default class EditorEventTransmitter extends Transmitter {
    supportedEvents = new Set(["request-focus-self"])

    constructor() {
        super()
        this.eventHandler.on("editor-focus", () => this.sendEvent("editor-focus"))
        this.eventHandler.on("editor-blur", () => this.sendEvent("editor-blur"))
    }

    attachToSet(set: TransmitterSet): void {
        super.attachToSet(set)
        this.addResponseHandler(Commands.EDITOR_EVENT_COMMAND, (player, buffer, size) => {
            let command = buffer.readString()
            if(this.supportedEvents.has(command)) {
                this.getEntity().emit(command)
            }
        })
    }

    sendEvent(event: string) {
        this.packIfEnabled(Commands.EDITOR_EVENT_COMMAND, (buffer) => {
            buffer.writeString(event)
        })
    }
}
