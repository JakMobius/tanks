
import ChatHUD, { ChatHUDProps } from "src/client/ui/chat-hud/chat-hud";
import { Commands } from "../commands";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import ReceiverComponent from "../receiving/receiver-component";
import WriteBuffer from "src/serialization/binary/write-buffer";

export default class ClientChatComponent extends ReceiverComponent {

    messages = [] as string[]

    onChatHandler = (message: string) => this.onMessage(message)
    getMessage = (message: number) => this.messages[message]

    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.CHAT_MESSAGE_COMMAND, (buffer) => {
            let message = buffer.readString()
            this.messages.push(message)
            this.updateHud()
        })
    }

    onMessage(message: string) {
        this.receiveComponent?.sendResponse(Commands.CHAT_MESSAGE_COMMAND, (buffer) => {
            buffer.writeString(message)
        })
    }

    updateHud() {
        let world = this.entity?.parent

        world.emit("hud-view", ChatHUD, {
            getMessage: this.getMessage,
            messageCount: this.messages.length,
            onChat: this.onChatHandler
        } as ChatHUDProps)
    }
}