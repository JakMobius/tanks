import Overlay, {OverlayConfig} from '../../../../ui/overlay/overlay';
import MapSelectContainer from './map-list/mapselectcontainer';
import MapPreviewContainer from './map-preview/mappreviewcontainer';
import DialogOverlay from '../../overlay/dialog/dialogoverlay';
import AirBlockState from "src/map/block-state/types/air-block-state";
import GameMap from "src/map/game-map";
import GameMapNameComponent from "src/client/map-editor/map-name-component";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";

export default class MenuOverlay extends Overlay {
	public mapSelect = new MapSelectContainer();
	public mapPreview = new MapPreviewContainer();

    constructor(options: OverlayConfig) {
        super(options);

        this.overlay.append(this.mapPreview.element)
        this.overlay.append(this.mapSelect.element)

        this.mapSelect.on("select", (map: GameMap) => {
            this.mapPreview.previewMap(map)
        })

        this.mapPreview.on("rename", (map: GameMap) => {
            this.mapSelect.updateMapTitle(map)
        })

        this.mapPreview.on("rename-commit", () => {
            this.mapSelect.saveMaps()
        })

        this.mapPreview.on("open", (map: GameMap) => {
            this.emit("open", map)
        })

        this.mapSelect.on("create", () => {
            this.createMap()
        })

        this.mapPreview.on("delete", (map: GameMap) => {
            this.deleteMap(map)
        })
    }

    createMap() {
        let creationOverlay = new DialogOverlay({
            root: this.overlay
        })

        creationOverlay.dialog.element.append(
            $("<table>").addClass("inputs").append(
                $("<tbody>")
                .append(
                    $("<tr>")
                    .append($("<td>").append("Имя карты"))
                    .append($("<td>").append(
                        $("<input>")
                            .addClass("name")
                            .attr("placeholder", "Карта")
                )))
                .append(
                    $("<tr>")
                        .append($("<td>").append("Ширина"))
                        .append($("<td>").append(
                            $("<input>")
                                .addClass("width")
                                .attr("placeholder", "50")
                                .attr("type", "number")
                )))
                .append(
                    $("<tr>")
                        .append($("<td>").append("Высота"))
                        .append($("<td>").append(
                            $("<input>")
                                .addClass("height")
                                .attr("placeholder", "50")
                                .attr("type", "number")
                )))
            )
        )

        creationOverlay.dialog.addButton({
            title: "Создать карту",
            onclick: () => {
                let widthStr = creationOverlay.dialog.element.find("input.width").val().toString() || "50"
                let heightStr = creationOverlay.dialog.element.find("input.height").val().toString() || "50"
                let name = creationOverlay.dialog.element.find("input.name").val().toString() || "Карта"

                let width = parseInt(widthStr)
                let height = parseInt(heightStr)

                if(Number.isNaN(width) || Number.isNaN(height) || width < 0 || height < 0 || width * height > 65535) {
                    return
                }

                let map = new GameMap({
                    width: width,
                    height: height,
                    data: Array.from({length: width * height}, (_, i) => new AirBlockState())
                })

                // TODO: this should be done by prefab alterator

                let nameComponent = new GameMapNameComponent()
                nameComponent.name = name
                map.addComponent(nameComponent)

                let historyComponent = new GameMapHistoryComponent()
                map.addComponent(historyComponent)

                this.mapSelect.maps.push(map)
                this.mapSelect.saveMaps()
                this.mapSelect.refreshMaps()
                creationOverlay.hide()
            }
        })

        creationOverlay.dialog.addButton({
            title: "Отмена",
            closes: true,
            side: "left"
        })

        creationOverlay.show()
    }

    deleteMap(map: GameMap) {
        let step = 0

        let deletionOverlay = new DialogOverlay({
            root: this.overlay
        })

        let deleteButton: JQuery = null
        let denyButton: JQuery = null

        const next = () => {
            deleteButton && deleteButton.remove()
            denyButton && denyButton.remove()
            dialog()
            step++
        }

        const deleteMap = () => {
            this.mapSelect.maps.splice(this.mapSelect.maps.indexOf(map), 1)
            this.mapSelect.saveMaps()
            this.mapSelect.refreshMaps()
            this.mapPreview.previewMap(null)
        }

        const dialog = () => {
            if (step === 0) {
                if(localStorage.getItem("dialog-passed") === "1") {
                    deletionOverlay.dialog.title("Ладно, ладно")
                    deletionOverlay.dialog.text("Раз уж ты так уверен в себе")

                    deleteButton = deletionOverlay.dialog.addButton({
                        title: "Наконец-то",
                        color: "#bb2b19",
                        closes: true,
                        onclick: () => {
                            localStorage.setItem("dialog-passed", "2")
                            deleteMap()
                        }
                    })
                    denyButton = deletionOverlay.dialog.addButton({
                        title: "Нет, я передумал",
                        side: "left",
                        closes: true,
                        onclick: () => {
                            localStorage.setItem("dialog-passed", "0")
                        }
                    })
                } else if(localStorage.getItem("dialog-passed") === "2") {
                    deletionOverlay.dialog.title("Снова ты?")
                    deletionOverlay.dialog.text("Что прикажете делать, Ваше Решительное Величество?")

                    deleteButton = deletionOverlay.dialog.addButton({
                        title: "Казнить",
                        color: "#bb2b19",
                        closes: true,
                        onclick: deleteMap
                    })
                    denyButton = deletionOverlay.dialog.addButton({
                        title: "Помиловать",
                        side: "left",
                        closes: true
                    })
                } else {
                    deletionOverlay.dialog.title("Удалить карту?")
                    deletionOverlay.dialog.text("Ты хорошо подумал?")

                    deleteButton = deletionOverlay.dialog.addButton({
                        title: "Да, отстань",
                        color: "#bb2b19",
                        closes: false,
                        onclick: next
                    })
                    denyButton = deletionOverlay.dialog.addButton({
                        title: "Я случайно нажал",
                        side: "left",
                        closes: true
                    })
                }
            } else if(step === 1) {
                deletionOverlay.dialog.title("Точно?")
                deletionOverlay.dialog.text("Может еще подумаешь? Такие решения так быстро не принимаются...")

                deleteButton = deletionOverlay.dialog.addButton({
                    title: "Да, точно.",
                    color: "#bb2b19",
                    closes: false,
                    side: "left",
                    onclick: next
                })

                denyButton = deletionOverlay.dialog.addButton({
                    title: "О нет, я снова ошибся",
                    closes: true
                })
            } else if(step === 2) {
                deletionOverlay.dialog.title("Не...")
                deletionOverlay.dialog.text("Ты слишком торопишься с решениями. Лучше обсуди это с мамой.")

                localStorage.setItem("dialog-passed", "1")

                denyButton = deletionOverlay.dialog.addButton({
                    title: "Какого хрена?",
                    closes: true,
                    width: "288px"
                })
            }
        }

        next()

        deletionOverlay.show()
    }

    redraw() {
        this.mapPreview.drawMap()
    }

    saveMaps() {
        return this.mapSelect.saveMaps()
    }
}