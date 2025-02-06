import './room-cell.scss'

import View from "src/client/ui/view";
import RoomCellStatusLabel from "./room-cell-status-label/room-cell-status-label";
import Button from "src/client/ui/button/button";

export interface RoomCellConfig {
    name: string
    map: string
    mode: string
    players: number
    maxPlayers: number
    callback?: () => void
}

export default class RoomCell extends View {
    constructor(config: RoomCellConfig) {
        super();

        this.element.addClass("room-cell-container")

        const line = $("<div>").addClass("room-cell-line")
        this.element.append(line)

        const roomCell = $("<div>").addClass("room-cell");
        this.element.append(roomCell)

        const topLine = $("<div>").addClass("room-cell-top-line")
        const title = $("<div>").addClass("room-cell-title")

        topLine.append(title)
        topLine.append(new RoomCellStatusLabel().playerCountStatus(config.players, config.maxPlayers).element)

        const mapIcon = $("<div>").addClass("room-cell-map-icon")
        const mapNameSpan = $("<span>").addClass("map-name")
        const mapModeSpan = $("<span>").addClass("map-mode")
        const mapDescr = $("<div>").addClass("room-cell-map-description")

        mapDescr.append(mapNameSpan)
        mapDescr.append(" ")
        mapDescr.append(mapModeSpan)

        const bottomLine = $("<div>").addClass("room-cell-bottom-line")
        bottomLine.append(mapIcon)
        bottomLine.append(mapDescr)

        title.text(config.name)
        mapNameSpan.text(config.map)
        mapModeSpan.text(config.mode)

        roomCell.append(topLine)
        roomCell.append(bottomLine)

        this.element.append(roomCell)
        this.element.append($("<div>").addClass("spacer"))

        let button = new Button("В бой!").largeStyle().element
        if(config.callback) {
            button.on("click", config.callback)
        }
        button.addClass("room-cell-button")
        this.element.append(button)
    }
}