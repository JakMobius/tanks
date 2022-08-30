/* @load-resource: './room-list-view.scss' */

import View from "../../../ui/view";
import {HubPage} from "../hub-page";
import RoomCell from "./room-cell/room-cell";
import Button from "../../../ui/button/button";
import GameCreateController from "../game-create/game-create-controller";

export default class RoomListView extends View {

    private page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("room-list-view")

        const box = $("<div>").addClass("room-list-box")
        const container = $("<div>").addClass("room-list-container")
        const header = $("<div>").addClass("room-list-header")
        const title = $("<div>").addClass("room-list-title").text("Игровые комнаты")
        const roomListScroll = $("<div>").addClass("room-list-scroll")
        const roomList = $("<div>").addClass("room-list")

        const createGameButton = new Button("Создать игру").largeStyle()
        createGameButton.element.on("click", () => {
            this.page.navigationController.pushController(new GameCreateController(this.page))
        })

        header.append(title)
        header.append(createGameButton.element)
        container.append(header)
        container.append(roomListScroll)
        roomListScroll.append(roomList)

        box.append(container)
        this.element.append(box)

        roomList.append(new RoomCell({
            name: "КОМНАТА РАДОСТИ И ВЕСЕЛЬЯ 😝",
            map: "Сильверстоун",
            mode: "TDM",
            players: 12,
            maxPlayers: 16
        }).element)

        roomList.append(new RoomCell({
            name: "Комната для игры в карточки ♠️",
            map: "Метка Трафальгара",
            mode: "DM",
            players: 4,
            maxPlayers: 8
        }).element)

        roomList.append(new RoomCell({
            name: "Международная комната 🛰",
            map: "Межгосударственные врата",
            mode: "FC",
            players: 3,
            maxPlayers: 16
        }).element)

        roomList.append(new RoomCell({
            name: "Комната 4",
            map: "Карта 4",
            mode: "Режим 4",
            players: 4,
            maxPlayers: 8
        }).element)

        roomList.append(new RoomCell({
            name: "Комната 5",
            map: "Карта 5",
            mode: "Режим 5",
            players: 5,
            maxPlayers: 10
        }).element)

        roomList.append(new RoomCell({
            name: "Комната 6",
            map: "Карта 6",
            mode: "Режим 6",
            players: 6,
            maxPlayers: 12
        }).element)

        roomList.append(new RoomCell({
            name: "Комната 7",
            map: "Карта 7",
            mode: "Режим 7",
            players: 7,
            maxPlayers: 14
        }).element)
    }
}