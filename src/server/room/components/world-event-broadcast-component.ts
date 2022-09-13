import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import Player from "../../player";
import RoomClientComponent from "./room-client-component";
import PlayerChatPacket from "../../../networking/packets/game-packets/player-chat-packet";
import HtmlEscape from "../../../utils/html-escape";
import DamageRecorderComponent from "../../entity/components/damage-recorder-component";
import PlayerConnectEvent from "../../../events/player-connect-event";
import PlayerDisconnectEvent from "../../../events/player-disconnect-event";
import EventEmitter from "../../../utils/event-emitter";
import PlayerChatEvent from "../../../events/player-chat-event";
import TeamColor from "../../../utils/team-color";

export default class WorldEventBroadcastComponent implements Component {
    entity: Entity | null;

    worldEventHandler = new BasicEventHandlerSet()

    constructor() {
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnected(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-disconnect", (event) => this.onPlayerDisconnected(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-chat", (event) => this.onPlayerChat(event), EventEmitter.PRIORITY_MONITOR)
    }

    broadcastMessage(message: string) {
        if (!this.entity) return
        let clientComponent = this.entity.getComponent(RoomClientComponent)

        if (!clientComponent) return
        clientComponent.portal.broadcast(new PlayerChatPacket(message))
    }

    protected onPlayerConnected(event: PlayerConnectEvent) {
        if(event.declined) return
        let color = event.player.team ? TeamColor.getColor(event.player.team.id).toChatColor(true) : "§!;"
        this.broadcastMessage(color + event.player.nick + "§; подключился к игре")
    }

    protected onPlayerDisconnected(event: PlayerDisconnectEvent) {
        let color = event.player.team ? TeamColor.getColor(event.player.team.id).toChatColor(true) : "§!;"
        this.broadcastMessage(color + event.player.nick + "§; отключился от игры")
    }

    protected onPlayerDeath(player: Player) {
        this.broadcastMessage(this.getBestDeathMessage(player) || this.defaultDeathMessage(player))
    }

    protected onPlayerChat(event: PlayerChatEvent) {
        if(event.cancelled) return
        let text = event.message
        text.trim()
        text = HtmlEscape(text)
        if (!text.length) return
        let color = event.player.team ? TeamColor.getColor(event.player.team.id).toChatColor(true) : "§!;"
        this.broadcastMessage(color + event.player.nick + "§;: " + text)
    }

    static killMessages = [
        {
            minKills: 1, maxKills: 2, messages: [
                "@0 уничтожил @1",
                "@0 убил @1",
                "@0 подорвал @1"
            ]
        }, {
            minKills: 3, maxKills: 4, messages: [
                "@0 снова убил @1",
                "@0 опять убил @1",
                "@0 вновь подорвал @1",
                "@0 убил @1 еще раз",
            ]
        }, {
            minKills: 5, maxKills: 7, messages: [
                "@0 в очередной раз уничтожил @1",
                "@0 вновь и вновь убивает @1",
                "@0 убивает @1 снова и снова",
                "@0 продолжает уничтожать @1"
            ]
        }, {
            minKills: 8, messages: [
                "@0 издевается над @1",
                "@0 унижает @1",
                "@0 смеется над @1",
                "@0 высмеивает @1",
                "@0 убивает @1 смеху ради",
                "@0 доминирует над @1",
                "@0 чувствует превосходство над @1",
                "@0 держит верх над @1",
            ]
        }
    ]

    private getPlayerTeamColor(player: Player) {
        return player.team ? TeamColor.getColor(player.team.id).toChatColor(true) : "§!;"
    }

    private getBestDeathMessage(player: Player) {
        let deathRecorder = this.entity.getComponent(DamageRecorderComponent)
        if (!deathRecorder) return null

        let damageData = deathRecorder.getDamageData(player)
        let killer = damageData.damagers[0]

        if (!killer || killer == player) return this.getPlayerTeamColor(player) + player.nick + "§; самоуничтожился"

        let killsInRow = deathRecorder.getDamageData(killer).rowKills.get(player) || 0

        for (let message of WorldEventBroadcastComponent.killMessages) {
            if (message.minKills > killsInRow) continue;
            if (message.maxKills && message.maxKills < killsInRow) continue;
            let variants = message.messages

            return variants[Math.floor(Math.random() * variants.length)]
                .replace("@0", this.getPlayerTeamColor(killer) + killer.nick + "§;")
                .replace("@1", this.getPlayerTeamColor(player) + player.nick + "§;")
        }

        return null
    }

    private defaultDeathMessage(player: Player) {
        return "§!F00;" + player.nick + "§; уничтожен"
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.worldEventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
    }
}