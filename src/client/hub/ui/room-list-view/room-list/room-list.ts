/* @load-resource: './room-list.scss' */

import View from "../../../../ui/view";
import LoadingView from "../../loading-view/loading-view";
import RoomCell from "../room-cell/room-cell";

export interface RoomConfig {
    name: string
    map: string
    mode: string
    players: number
    maxPlayers: number
}

export class RoomList extends View {

    scrollView = $("<div>").addClass("room-list-scroll")
    title = $("<div>").addClass("room-list-title")
    actionButton = $("<div>").addClass("room-list-action-button")
    loadingView = new LoadingView()

    constructor() {
        super();

        this.element.addClass("room-list")

        const box = $("<div>").addClass("room-list-box")
        const container = $("<div>").addClass("room-list-container")
        const header = $("<div>").addClass("room-list-header")

        header.append(this.title)
        header.append(this.actionButton)
        container.append(header)
        container.append(this.scrollView)
        container.append(this.loadingView.element)

        this.loadingView.hide()

        box.append(container)
        this.element.append(box)
    }

    handleNoRooms() {

    }

    setRooms(rooms: RoomConfig[]) {
        this.scrollView.empty()
        if(rooms.length === 0) {
            this.handleNoRooms()
        } else {
            let addSeparator = false
            for (let room of rooms) {
                if(addSeparator) {
                    this.scrollView.append($("<div>").addClass("room-list-separator"))
                }

                this.scrollView.append(new RoomCell({
                    name: room.name,
                    map: room.map,
                    mode: room.mode,
                    players: room.players,
                    maxPlayers: room.maxPlayers,
                    callback: () => this.enterRoom(room.name)
                }).element)

                addSeparator = true
            }
        }
    }

    private enterRoom(room: string) {
        location.href = "/game?room=" + room
    }
}