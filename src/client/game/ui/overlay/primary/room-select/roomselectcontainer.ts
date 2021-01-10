/* @load-resource: './room-select.scss' */

import Menu from 'src/client/ui/menu/menu';

import Dropdown from '../../../../../ui/elements/dropdown/dropdown';
import Room from "../../../../../../server/room/room";
import {ClientRoomInformation} from "../../../../../../networking/packets/game-packets/roomlistpacket";

class RoomSelectContainer extends Menu {
	public selectedRoom: string;
	public dropdown: Dropdown;

    constructor() {
        super();

        this.selectedRoom = null
        this.dropdown = new Dropdown()
        this.element.append(this.dropdown.element)
        this.element.addClass("menu room-select")

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

    updateRooms(rooms: ClientRoomInformation[]): void {
        this.dropdown.setOptionCount(rooms.length)

        this.dropdown.getOptions().each((index: number, element: HTMLElement) => {
            let option = $(element)
            const room = rooms[index]
            const disabled = room.currentOnline >= room.maxOnline;

            option.data("value", room.name)

            if(disabled) option.addClass("disabled")
            else option.removeClass("disabled")

            option.find(".room-name").text(room.name)
            option.find(".room-playersOnline").text(room.currentOnline)
            option.find(".room-max-playersOnline").text(room.maxOnline)

            if(this.selectedRoom === room.name) {
                this.dropdown.selectOption(option)
            }
        })
    }
}

export default RoomSelectContainer;