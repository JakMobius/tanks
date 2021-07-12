/* @load-resource: './room-select.scss' */

import Menu from 'src/client/ui/menu/menu';

import Dropdown from 'src/client/ui/elements/dropdown/dropdown';
import {ClientRoomInformant} from "src/networking/packets/game-packets/roomlistpacket";

class RoomSelectContainer extends Menu {
	public selectedRoom: string;
	public dropdown: Dropdown;

    constructor() {
        super();

        this.selectedRoom = null
        this.dropdown = new Dropdown()
        this.element.append(this.dropdown.element)
        this.element.addClass("room-select")

        this.dropdown.on("expand", () => {
            this.element.addClass("expanded")
        })

        this.dropdown.on("collapse", () => {
            this.element.removeClass("expanded")
        })

        this.dropdown.on("select", (option: JQuery) => {
            let room = option.find(".room-name").text()

            if(room === this.selectedRoom) return
            this.selectedRoom = room

            this.emit("select", room)
        })

        this.dropdown.prototypeCell
            .append($("<span>").addClass("room-name"))
            .append(" (")
            .append($("<span>").addClass("room-playersOnline"))
            .append(" / ")
            .append($("<span>").addClass("room-max-playersOnline"))
            .append(")")
    }

    selectRoom(room: string): void {
        this.selectedRoom = room

        this.dropdown.getOptions().each((index: number, element: HTMLElement) => {
            let option = $(element)
            if(option.data("value") === room) {
                this.dropdown.selectOption(option)
                return false
            }
            return void 0
        })
    }

    updateRooms(rooms: ClientRoomInformant[]): void {
        this.dropdown.setOptionCount(rooms.length)

        this.dropdown.getOptions().each((index: number, element: HTMLElement) => {
            let option = $(element)
            const room = rooms[index]
            const disabled = room.getCurrentOnline() >= room.getMaxOnline();

            option.data("value", room.getName())

            if(disabled) option.addClass("disabled")
            else option.removeClass("disabled")

            option.find(".room-name").text(room.getName)
            option.find(".room-playersOnline").text(room.getCurrentOnline())
            option.find(".room-max-playersOnline").text(room.getMaxOnline())

            if(this.selectedRoom === room.getName()) {
                this.dropdown.selectOption(option)
            }
        })
    }
}

export default RoomSelectContainer;