
import ChatHUD, { ChatHUDProps } from "src/client/ui/chat-hud/chat-hud";
import { Commands } from "../../../components/network/commands";
import EntityDataReceiveComponent from "../../../components/network/receiving/entity-data-receive-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import { GameHudListenerComponent } from "src/client/ui/game-hud/game-hud";

export default class ClientChatComponent extends EventHandlerComponent {

    messages = [] as string[]
    receiveComponent: EntityDataReceiveComponent | null = null

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

    constructor() {
        super()

        this.eventHandler.on("hud-attach", (hud: GameHudListenerComponent) => {
            hud.addListener(this.entity, "hud-view")
            this.updateHud()
        })

        this.eventHandler.on("hud-detach", (hud: GameHudListenerComponent) => {
            hud.removeListener(this.entity, "hud-view")
        })
    }

    updateHud() {
        this.entity.emit("hud-view", ChatHUD, {
            getMessage: this.getMessage,
            messageCount: this.messages.length,
            onChat: this.onChatHandler
        } as ChatHUDProps)
    }
    
    onAttach(entity: Entity): void {
        super.onAttach(entity)
        let component = this.entity.getComponent(EntityDataReceiveComponent)
        if (component) {
            this.receiveComponent = component
            this.hook(component)
        }
    }
}