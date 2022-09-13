import {RoomList} from "./room-list";

export default class UserRoomList extends RoomList {

    constructor() {
        super();

        this.title.text("Ваши комнаты")
        this.actionButton.text("Создать новую").on("click", () => this.emit("room-create"))
    }

    handleNoRooms() {
        this.loadingView.show()

        let actionButton = $("<a>")
            .text("создавайте комнату")
            .on("click", () => this.emit("room-create"))

        this.loadingView.icon.hide()
        this.loadingView.subtitle.show()
            .append("Этот список испытывает душевную пустоту.")
            .append("<br/>")
            .append("Срочно ", actionButton, " и зовите в неё всех своих друзей!")
    }
}