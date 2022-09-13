/* @load-resource: './room-list-view.scss' */

import View from "../../../ui/view";
import {HubPage} from "../hub-page";
import GameCreateController from "../game-create/game-create-controller";
import {localizeAjaxError} from "../../localizations";
import HugeTitle from "../huge-title/huge-title";
import RoomLoadingPlaceholderMenu from "./room-loading-placeholder-menu/room-loading-placeholder-menu";
import UserRoomList from "./room-list/user-room-list";
import GlobalRoomList from "./room-list/global-room-list";

export default class RoomListView extends View {

    private page: HubPage;

    private title = new HugeTitle()
    private userRoomList = new UserRoomList()
    private globalRoomList = new GlobalRoomList()
    private loadingMenu = new RoomLoadingPlaceholderMenu()

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("room-list-view")

        this.title.element.text("Игровые комнаты")

        this.userRoomList.on("room-create", () => this.navigateToRoomCreation())

        this.element.append(
            this.title.element,
            this.userRoomList.element,
            this.globalRoomList.element,
            this.loadingMenu.element)

        this.fetchRooms()
    }

    private navigateToRoomCreation() {
        this.page.navigationController.pushController(new GameCreateController(this.page))
    }

    private setLoading(loading: boolean) {
        if(loading) {
            this.userRoomList.element.hide()
            this.globalRoomList.element.hide()
            this.loadingMenu.element.show()
            this.loadingMenu.loadingView.title.show().text("Пожалуйста, подождите...")
            this.loadingMenu.loadingView.subtitle.text("Дайте танчику подумать")
        } else {
            this.userRoomList.element.show()
            this.globalRoomList.element.show()
            this.loadingMenu.element.hide()
        }
    }

    private fetchRooms() {
        this.setLoading(true)
        this.userRoomList.scrollView.empty()
        this.globalRoomList.scrollView.empty()

        $.ajax({
            url: "ajax/room-list",
            method: "GET"
        }).done((data: any) => {
            this.onRoomFetchResult(data)
        }).fail((jqXHR: JQuery.jqXHR, exception: string) => {
            this.onRoomFetchError(jqXHR, exception)
        })
    }

    private onRoomFetchResult(data: any) {
        this.setLoading(false)
        let result = data.result

        if(result === 'ok') {
            this.globalRoomList.setRooms(data.rooms)
            this.userRoomList.setRooms([])
        } else if(result === "not-authenticated") {
            window.location.reload()
        }
    }

    private onRoomFetchError(jqXHR: JQuery.jqXHR, exception: string) {
        this.loadingMenu.loadingView.title.hide()

        let retryButton = $("<a>")
            .text("попробовать еще раз")
            .on("click", () => this.fetchRooms())

        this.loadingMenu.loadingView.subtitle
            .empty()
            .append(localizeAjaxError(jqXHR, exception))
            .append("<br/>")
            .append("Может быть, стоит ", retryButton, "?")
    }
}