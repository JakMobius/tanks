/* @load-resource: './room-cell.scss' */

import View from "../../../../ui/view";
import RoomCellStatusLabel from "./room-cell-status-label/room-cell-status-label";
import Button from "../../../../ui/button/button";

export interface RoomCellConfig {
    name: string
    map: string
    mode: string
    players: number
    maxPlayers: number
}

export default class RoomCell extends View {
    constructor(config: RoomCellConfig) {
        super();

        this.element.addClass("room-cell");

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

        this.element.append(topLine)
        this.element.append(bottomLine)
    }
}