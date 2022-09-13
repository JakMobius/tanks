/* @load-resource: './room-cell-status-label.scss' */

import View from "src/client/ui/view";

export default class RoomCellStatusLabel extends View {

    statusText: JQuery
    statusIcon: JQuery

    constructor() {
        super()
        this.element.addClass("room-cell-status")
        this.statusText = $("<div>").addClass("room-cell-status-text")
        this.statusIcon = $("<div>").addClass("room-cell-status-icon")

        this.element.append(this.statusIcon)
        this.element.append(this.statusText)
    }

    playerCountStatus(players: number, max: number) {
        this.statusIcon.addClass("turned")
        this.statusIcon.css("background-image", "url(\"assets/classic-tank.png\")")
        this.statusText.text(players + "/" + max)
        return this
    }
}