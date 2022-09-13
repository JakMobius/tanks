import {RoomList} from "./room-list";

export default class GlobalRoomList extends RoomList {

    constructor() {
        super();

        this.title.text("Комнаты других игроков")
        this.actionButton.text("Поиск").on("click", () => this.emit("search"))
    }

    handleNoRooms() {
        this.loadingView.show()

        this.loadingView.icon.show()
        this.loadingView.title.hide()
        this.loadingView.subtitle.show()
            .append("Этому танчику грустно, потому что больше никто не хочет играть")
    }

}