/* @load-resource: './game-create-view.scss' */

import View from "src/client/ui/view";
import {HubPage} from "../hub-page";
import HugeTitle from "../huge-title/huge-title";
import HugeTextInput from "../huge-text-input/huge-text-input";
import HugeSelect from "../huge-select/huge-select";
import Button from "src/client/ui/button/button";
import {checkRoomName} from "src/data-checkers/room-name-checker";
import {localizeAjaxError, textFromRoomNameCheckResult} from "src/client/hub/localizations";
import {TipStyle} from "../input-tip-list/input-tip-list-view";

export default class GameCreateView extends View {
    private page: HubPage;

    gameNameInput = new HugeTextInput()
    gameMapSelect = new HugeSelect()
    gameModeSelect = new HugeSelect()
    createButton = new Button().largeStyle()
    request: JQuery.jqXHR | null = null

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("game-create-view")

        const title = new HugeTitle()
        title.element.text("Новая комната")

        this.gameNameInput.setPlaceholder("Название комнаты")

        this.createButton.element.text("В бой!")
        this.createButton.element.addClass("game-create-button")

        this.element.append(title.element)
        this.element.append(this.gameNameInput.element)
        this.element.append(this.gameMapSelect.element)
        this.element.append(this.gameModeSelect.element)
        this.element.append(this.createButton.element)

        this.fetchMaps()

        this.gameModeSelect.setOptions([
            { name: "Битва команд (TDM)", data: "TDM", defaultSelected: true },
            { name: "Каждый сам за себя (DM)", data: "DM" },
            { name: "Захват флага (FC)", data: "FC" }
        ])

        this.createButton.element.on("click", () => this.handleCreateClick())
        this.gameNameInput.input.on("input", () => this.handleInput())

        this.gameNameInput.addTips()
    }

    private setMenuInteractive(interactive: boolean) {
        if(interactive) {
            this.createButton.element.text("В бой!")
        } else {
            this.createButton.element.text("Загрузка...")
        }

        this.createButton.element.prop("disabled", !interactive)
        this.gameNameInput.element.prop("disabled", !interactive)
        this.gameMapSelect.element.prop("disabled", !interactive)
        this.gameModeSelect.element.prop("disabled", !interactive)
    }

    private handleCreateClick() {
        if(this.updateValidity()) {
            this.createRoom()
        }
    }

    private handleInput() {
        this.updateValidity()
    }

    private updateValidity() {
        let errors = checkRoomName(this.gameNameInput.input.val() as string).map(reason => {
            return {
                text: textFromRoomNameCheckResult(reason),
                style: TipStyle.ERROR
            }
        })

        this.gameNameInput.tips.setTips(errors)
        return errors.length === 0
    }

    private createRoom() {
        this.setMenuInteractive(false)

        let name = this.gameNameInput.input.val() as string
        let map = this.gameMapSelect.select.val() as string
        let mode = this.gameModeSelect.select.val() as string

        this.request = $.ajax({
            url: "ajax/room-create",
            method: "post",
            data: {
                name: name,
                map: map,
                mode: mode
            },
        }).done((data) => {
            this.roomCreateResponse(data)
        }).fail((data, exception) => {
            this.roomCreationFailed(data, exception)
        })
    }

    private roomCreateResponse(result: any) {
        this.setMenuInteractive(true)
        this.request = null

        switch(result.result) {
            case "ok":
                window.location.href = result.url
                break;
            case "not-authenticated":
                window.location.reload()
                break;
            case "invalid-map":
                this.page.eventContainer.createEvent("Сервер запутался в картах. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-mode":
                this.page.eventContainer.createEvent("Произошло что-то очень странное. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-room-name":
                this.updateValidity()
                this.page.eventContainer.createEvent("Недопустимое название комнаты. Попробуйте другое.")
                break;
            case "room-name-taken":
                this.handleRoomNameTaken()
                break;
        }
    }

    private roomCreationFailed(xhr: JQuery.jqXHR, exception: string) {
        this.setMenuInteractive(true)
        this.request = null

        this.page.eventContainer.createEvent(localizeAjaxError(xhr, exception))
    }

    onBlur() {
        if(this.request) {
            this.request.abort()
            this.request = null
        }
    }

    private fetchMaps() {
        this.setMenuInteractive(false)

        $.ajax({
            url: "ajax/map-list",
            method: "get"
        }).done((data) => {
            this.onMapFetchResult(data);
        }).fail((data, exception) => {
            this.onMapFetchError(data, exception)
        })
    }

    private onMapFetchResult(data: any) {
        this.setMenuInteractive(true)
        this.gameMapSelect.setOptions(data.maps.map((map: any) => {
            return {
                name: map.name,
                data: map.value,
            }
        }))
    }

    private onMapFetchError(data: JQuery.jqXHR, exception: string) {
        // TODO: error
    }

    private handleRoomNameTaken() {
        this.gameNameInput.tips.setTips([{
            text: "Имя комнаты занято",
            style: TipStyle.ERROR
        }])
    }
}

