import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import EventEmitter from "src/utils/event-emitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import {chooseRandom} from "src/utils/utils";
import ServerChatComponent from "src/entity/types/chat/server-side/server-chat-component";

export default class WorldEventBroadcastComponent extends EventHandlerComponent {

    constructor() {
        super()
        this.eventHandler.on("player-connect", (player) => this.onPlayerConnect(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-will-disconnect", (player) => this.onPlayerDisconnect(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-death", (player) => this.onPlayerDeath(player), EventEmitter.PRIORITY_MONITOR)
    }

    broadcastMessage(message: string) {
        this.entity?.emit("chat", message)
    }

    protected onPlayerConnect(player: Entity) {
        this.broadcastMessage(ServerChatComponent.getPlayerColoredNick(player) + " подключился к игре")
    }

    protected onPlayerDisconnect(player: Entity) {
        this.broadcastMessage(ServerChatComponent.getPlayerColoredNick(player) + " отключился от игры")
    }

    protected onPlayerDeath(player: Entity) {
        this.broadcastMessage(this.getBestDeathMessage(player) || this.defaultDeathMessage(player))
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

        if (!killer || killer == player) return ServerChatComponent.getPlayerTeamColor(player) + playerNick + "§; самоуничтожился"

        const killerNick = killer.getComponent(PlayerNickComponent).nick

        let killsInRow = deathRecorderComponent.getDamageData(killer).rowKills.get(player) || 0

        for (let message of WorldEventBroadcastComponent.killMessages) {
            if (message.minKills > killsInRow) continue;
            if (message.maxKills && message.maxKills < killsInRow) continue;
            let variants = message.messages

            return chooseRandom(variants)
                .replace("@0", ServerChatComponent.getPlayerTeamColor(killer) + killerNick + "§;")
                .replace("@1", ServerChatComponent.getPlayerTeamColor(player) + playerNick + "§;")
        }

        return null
    }

    private defaultDeathMessage(player: Entity) {
        return ServerChatComponent.getPlayerColoredNick(player) + " уничтожен"
    }
}