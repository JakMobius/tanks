/* @load-resource: './room-select.scss' */

const View = require("../../../../../ui/view")
const Dropdown = require("../../../../../ui/elements/dropdown/dropdown")

class RoomSelectContainer extends View {
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

        this.dropdown.on("select", (option) => {
            let room = option.find(".room-name").text()

            if(room === this.selectedRoom) return
            this.selectedRoom = room

            this.emit("select", room)
        })

        this.dropdown.prototypeCell
            .append($("<span>").addClass("room-name"))
            .append(" (")
            .append($("<span>").addClass("room-online"))
            .append(" / ")
            .append($("<span>").addClass("room-max-online"))
            .append(")")
    }

    selectRoom(room) {
        this.selectedRoom = room

        this.dropdown.getOptions().each((index, option) => {
            option = $(option)
            if(option.data("value") === room) {
                this.dropdown.selectOption(option)
                return false
            }
        })
    }

    updateRooms(rooms) {
        this.dropdown.setOptionCount(rooms.length)

        this.dropdown.getOptions().each((index, option) => {
            option = $(option)
            const room = rooms[index]
            const disabled = room.online >= room.maxOnline;

            option.data("value", room.name)

            if(disabled) option.addClass("disabled")
            else option.removeClass("disabled")

            option.find(".room-name").text(room.name)
            option.find(".room-online").text(room.online)
            option.find(".room-max-online").text(room.maxOnline)

            if(this.selectedRoom === room.name) {
                this.dropdown.selectOption(option)
            }
        })
    }
}

module.exports = RoomSelectContainer