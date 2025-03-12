import { Commands } from "src/entity/components/network/commands"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component"
import BasicEventHandlerSet from "src/utils/basic-event-handler-set"
import Entity from "src/utils/ecs/entity"

export default class EditorEventReceiver extends ReceiverComponent {
    supportedEvents = new Set(["editor-focus", "editor-blur"])

    eventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.eventHandler.on("request-focus-self", () => this.sendCommand("request-focus-self"))
    }

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.EDITOR_EVENT_COMMAND, (buffer) => {
            let event = buffer.readString()
            if (this.supportedEvents.has(event)) {
                this.entity.emit(event)
            }
        })
    }

    sendCommand(command: string) {
        this.receiveComponent.sendResponse(Commands.EDITOR_EVENT_COMMAND, (buffer) => {
            buffer.writeString(command)
        })
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        super.onDetach()
    }
}