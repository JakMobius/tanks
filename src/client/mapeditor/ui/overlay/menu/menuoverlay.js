
const Overlay = require("../../../../ui/overlay/overlay")
const MapSelectContainer = require("./map-list/mapselectcontainer")
const MapPreviewContainer = require("./map-preview/mappreviewcontainer")
const DialogOverlay = require("../../overlay/dialog/dialogoverlay")
const EditorMap = require("../../../editormap")

class MenuOverlay extends Overlay {

    constructor(options) {
        super(options);

        this.mapSelect = new MapSelectContainer()
        this.mapPreview = new MapPreviewContainer()

        this.overlay.append(this.mapPreview.element)
        this.overlay.append(this.mapSelect.element)

        this.mapSelect.on("select", (map) => {
            this.mapPreview.previewMap(map)
        })

        this.mapPreview.on("rename", (map) => {
            this.mapSelect.updateMapTitle(map)
        })

        this.mapPreview.on("rename-commit", () => {
            this.mapSelect.saveMaps()
        })

        this.mapPreview.on("open", (map) => {
            this.emit("open", map)
        })

        this.mapSelect.on("create", () => {
            this.createMap()
        })

        this.mapPreview.on("delete", (map) => {
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
                let width = creationOverlay.dialog.element.find("input.width").val() || "50"
                let height = creationOverlay.dialog.element.find("input.height").val() || "50"
                let name = creationOverlay.dialog.element.find("input.name").val() || "Карта"

                width = parseInt(width)
                height = parseInt(height)

                if(Number.isNaN(width) || Number.isNaN(height) || width < 0 || height < 0 || width * height > 65535) {
                    return
                }

                let map = new EditorMap({
                    name: name,
                    width: width,
                    height: height
                })

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

    deleteMap(map) {
        let step = 0

        let deletionOverlay = new DialogOverlay({
            root: this.overlay
        })

        let deleteButton = null
        let denyButton = null

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

module.exports = MenuOverlay