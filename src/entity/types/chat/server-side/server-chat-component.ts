import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import { TransmitterSet } from "src/entity/components/network/transmitting/transmitter-set";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TeamColor from "src/utils/team-color";
import PlayerTeamComponent from "../../player/server-side/player-team-component";
import PlayerNickComponent from "../../player/server-side/player-nick-component";
import HTMLEscape from "src/utils/html-escape";

export class ChatTransmitter extends Transmitter {
    onEnable() {
        super.onEnable()
        this.eventHandler.on("chat", (message: string) => this.sendMessage(message))
    }

    attachToSet(set: TransmitterSet): void {
        super.attachToSet(set)
        this.addResponseHandler(Commands.CHAT_MESSAGE_COMMAND, (buffer) => {
            let player = this.set.receivingEnd.player
            let string = buffer.readString()
            string.trim()
            string = HTMLEscape(string)
            if (!string.length) return

            let message = ServerChatComponent.getPlayerColoredNick(player) + ": " + string
            this.getEntity().emit("chat", message)
        })
    }

    sendMessage(message: string) {
        this.packIfEnabled(Commands.CHAT_MESSAGE_COMMAND, (buffer) => {
            buffer.writeString(message)
        })
    }
}

export default class ServerChatComponent extends EventHandlerComponent {

    worldEventListener = new BasicEventHandlerSet()

    constructor() {
        super()

        this.eventHandler.on("transmitter-set-added", (transmitterSet) => {
            transmitterSet.initializeTransmitter(ChatTransmitter)
        })

        this.eventHandler.on("attached-to-parent", () => this.updateWorld())
        this.eventHandler.on("detached-from-parent", () => this.updateWorld())
        
        this.worldEventListener.on("chat", (message: string) => {
            this.entity.emit("chat", message)
        })
    }

    updateWorld() {
        this.worldEventListener.setTarget(this.entity?.parent)
    }

    static getPlayerTeamColor(player: Entity) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)
        if (!playerTeamComponent.team) return "§!;"

        return TeamColor.getColor(playerTeamComponent.team.id).toChatColor(true)
    }

    static getPlayerColoredNick(player: Entity) {
        const playerNick = player.getComponent(PlayerNickComponent).nick
        return this.getPlayerTeamColor(player) + playerNick + "§;"
    }
}
