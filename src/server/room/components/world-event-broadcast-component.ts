import RoomClientComponent from "./room-client-component";
import PlayerChatPacket from "src/networking/packets/game-packets/player-chat-packet";
import HtmlEscape from "src/utils/html-escape";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import EventEmitter from "src/utils/event-emitter";
import PlayerChatEvent from "src/events/player-chat-event";
import TeamColor from "src/utils/team-color";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import {chooseRandom} from "src/utils/utils";

export default class WorldEventBroadcastComponent extends EventHandlerComponent {

    constructor() {
        super()
        this.eventHandler.on("player-connect", (player) => this.onPlayerConnect(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-will-disconnect", (player) => this.onPlayerDisconnect(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-death", (player) => this.onPlayerDeath(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-chat", (player, event) => this.onPlayerChat(event), EventEmitter.PRIORITY_MONITOR)
    }

    broadcastMessage(message: string) {
        if (!this.entity) return
        let clientComponent = this.entity.getComponent(RoomClientComponent)

        if (!clientComponent) return
        clientComponent.portal.broadcast(new PlayerChatPacket(message))
    }

    private getPlayerTeamColor(player: Entity) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)
        if (!playerTeamComponent.team) return "§!;"

        return TeamColor.getColor(playerTeamComponent.team.id).toChatColor(true)
    }

    private getPlayerColoredNick(player: Entity) {
        const playerNick = player.getComponent(PlayerNickComponent).nick
        return this.getPlayerTeamColor(player) + playerNick + "§;"
    }

    protected onPlayerConnect(player: Entity) {
        this.broadcastMessage(this.getPlayerColoredNick(player) + " подключился к игре")
    }

    protected onPlayerDisconnect(player: Entity) {
        this.broadcastMessage(this.getPlayerColoredNick(player) + " отключился от игры")
    }

    protected onPlayerDeath(player: Entity) {
        this.broadcastMessage(this.getBestDeathMessage(player) || this.defaultDeathMessage(player))
    }

    protected onPlayerChat(event: PlayerChatEvent) {
        if(event.cancelled) return
        let text = event.message
        text.trim()
        text = HtmlEscape(text)
        if (!text.length) return
        this.broadcastMessage(this.getPlayerColoredNick(event.player) + ": " + text)
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

    private getBestDeathMessage(player: Entity) {
        const playerNick = player.getComponent(PlayerNickComponent).nick
        const deathRecorderComponent = this.entity.getComponent(DamageRecorderComponent)
        if (!deathRecorderComponent) return null

        let damageData = deathRecorderComponent.getDamageData(player)
        let killer = damageData.damagers[0]

        if (!killer || killer == player) return this.getPlayerTeamColor(player) + playerNick + "§; самоуничтожился"

        const killerNick = killer.getComponent(PlayerNickComponent).nick

        let killsInRow = deathRecorderComponent.getDamageData(killer).rowKills.get(player) || 0

        for (let message of WorldEventBroadcastComponent.killMessages) {
            if (message.minKills > killsInRow) continue;
            if (message.maxKills && message.maxKills < killsInRow) continue;
            let variants = message.messages

            return chooseRandom(variants)
                .replace("@0", this.getPlayerTeamColor(killer) + killerNick + "§;")
                .replace("@1", this.getPlayerTeamColor(player) + playerNick + "§;")
        }

        return null
    }

    private defaultDeathMessage(player: Entity) {
        return this.getPlayerColoredNick(player) + " уничтожен"
    }
}