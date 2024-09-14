/* @load-resource: './player-list-overlay.scss' */

import Overlay from "src/client/ui/overlay/overlay";
import Entity from "src/utils/ecs/entity";
import WorldStatisticsComponent, {
    PlayerStatistics
} from "src/entity/components/network/world-statistics/world-statistics-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import TeamColor from "src/utils/team-color";
import {ControlsResponder} from "src/client/controls/root-controls-responder";

export interface PlayerListOverlayConfig {
    gameControls: ControlsResponder
}

export default class PlayerListOverlay extends Overlay {

    playerListMenu = $("<div>").addClass("player-list-menu")
    playerListHeader = $("<div>").addClass("player-list-header")
    playerListCloud = $("<div>").addClass("player-list-cloud")

    mapNameCloud = $("<div>").addClass("cloud")
    roomTimeCloud = $("<div>").addClass("cloud")

    table = $("<table>").addClass("player-list-table")
    tableBody = $("<tbody>")

    world: Entity | null
    timerEventHandler = new BasicEventHandlerSet()
    worldEventHandler = new BasicEventHandlerSet()

    constructor(options: PlayerListOverlayConfig) {
        super();

        this.element.addClass("player-list-overlay")

        this.setupTable()

        this.playerListHeader.append(this.mapNameCloud)
        this.playerListHeader.append(this.roomTimeCloud)

        this.playerListMenu.append(this.playerListHeader)
        this.playerListMenu.append(this.playerListCloud)
        this.element.append(this.playerListMenu)

        options.gameControls.on("game-player-list-show", () => this.show())
        options.gameControls.on("game-player-list-hide", () => this.hide())

        this.worldEventHandler.on("player-statistics-updated", () => {
            this.updateTable()
        })

        this.worldEventHandler.on("map-name-updated", () => {
            this.updateMapName()
        })

        this.worldEventHandler.on("match-timer-set", () => {
            this.hookTimer()
        })
    }

    setGameWorld(world: Entity) {
        this.world = world

        this.worldEventHandler.setTarget(world)

        this.timerEventHandler.on("timer-transmit", () => {
            this.updateTimerText()
        })
    }

    setupTableHeader() {
        const thead = $("<thead>")
        const tr = $("<tr>").addClass("player-list-table-header")
        const separator = $("<tr>").addClass("player-list-table-separator")

        const columns = ["Имя", "Счёт", "Смертей", "Убийств", "У/С"]
        tr.append(columns.map((column) => $("<th>").text(column)))

        thead.append(tr, separator)
        this.table.append(thead)
    }

    generatePlayerRow(player: PlayerStatistics) {
        const tr = $("<tr>").addClass("player-list-table-row")

        let killRate = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : "-"

        let nick = $("<span>")
            .addClass("player-list-nickname")
            .text(player.name)

        nick.css("color", TeamColor.getColor(player.teamId).code())

        tr.append($("<th>").append(nick))

        const columns = [player.score, player.deaths, player.kills, killRate]
        tr.append(columns.map((column) => $("<th>").text(column)))

        return tr
    }

    setupTable() {
        this.playerListCloud.empty()

        this.setupTableHeader()
        this.table.append(this.tableBody)

        this.playerListCloud.append(this.table)
    }

    getTimerText() {
        let timerEntity = this.world.getComponent(WorldStatisticsComponent).matchTimeLeftTimer
        if(!timerEntity) return null

        let timerComponent = timerEntity.getComponent(TimerComponent)
        if(!timerComponent) return null

        return timerComponent.getMSTimeString()
    }

    updateMapName() {
        let statistics = this.world.getComponent(WorldStatisticsComponent)
        if(statistics.mapName) {
            this.mapNameCloud.show()
            this.mapNameCloud.text(statistics.mapName)
        } else {
            this.mapNameCloud.hide()
        }
    }

    hookTimer() {
        let timerEntity = this.world.getComponent(WorldStatisticsComponent).matchTimeLeftTimer
        this.timerEventHandler.setTarget(timerEntity)
        if(timerEntity) this.updateTimerText()
    }

    updateTimerText() {
        let timerText = this.getTimerText()
        if(timerText) {
            this.roomTimeCloud.show()
            this.roomTimeCloud.text(timerText)
        }
        else this.roomTimeCloud.hide()
    }

    updateTable() {
        let statistics = this.world.getComponent(WorldStatisticsComponent)
        this.tableBody.empty()

        for(let player of statistics.playerStatistics) {
            this.tableBody.append(this.generatePlayerRow(player))
        }
    }
}