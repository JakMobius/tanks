/* @load-resource: './map-list.scss' */

import Menu from '../../../../../ui/menu/menu';

import MapStorage from '../../../../map-storage';
import DragListener from '../../../element/dragoverlay';
import {trimFileExtension} from '../../../../../../utils/utils';
import GameMapNameComponent from "../../../../map-name-component";
import GameMapHistoryComponent from "../../../../history/game-map-history-component";
import DialogOverlay from "../../dialog/dialogoverlay";
import GameMap from "../../../../../../map/game-map";
import MapSerialization from "../../../../../../map/map-serialization";
import pako from "pako";

export default class MapSelectContainer extends Menu {
    public noMapsLabel: JQuery;
    public mapContainer: JQuery;
    public mapList: JQuery;
    public footer: JQuery;
    public createNewMapButton: JQuery;
    public maps: GameMap[];
    public dragListener: DragListener;
    public selectedMap: GameMap;

    constructor() {
        super();

        this.element.addClass("editor-map-list")

        this.noMapsLabel =
            $("<div>").addClass("center-text-container")
                .append($("<div>").addClass("center-text")
                    .append($("<div>").addClass("large").text("Нет карт"))
                    .append($("<div>").addClass("small").text("Создайте новую карту или перетяните файл в это окно"))
                )

        this.mapContainer = $("<div>").addClass("map-list-container")
        this.mapList = $("<div>").addClass("map-list")
        this.footer = $("<div>").addClass("footer")
        this.createNewMapButton = $("<button>").addClass("large").text("Создать новую карту").click(() => this.emit("create"))

        this.element.append(this.mapContainer, this.footer)
        this.footer.append(this.createNewMapButton)
        this.mapContainer.append(this.mapList, this.noMapsLabel)

        this.maps = []

        this.dragListener = new DragListener(this.element)
        this.element.append(this.dragListener.element)
        this.dragListener.startListening()
        this.dragListener.on("file", (file) => {
            try {
                let map = MapSerialization.fromBuffer(pako.inflate(file.buffer))

                // TODO: this should be done by prefab alterator

                let nameComponent = map.getComponent(GameMapNameComponent)
                let historyComponent = map.getComponent(GameMapHistoryComponent)

                if (!nameComponent) {
                    nameComponent = new GameMapNameComponent()
                    nameComponent.name = trimFileExtension(file.name)
                    map.addComponent(nameComponent)
                }

                if (!historyComponent) {
                    historyComponent = new GameMapHistoryComponent()
                    map.addComponent(historyComponent)
                }

                this.maps.push(map)

                this.saveMaps()
            } catch (e) {
                let overlay = new DialogOverlay({root: $(document.body)})
                overlay.dialog
                    .title("Не удалось прочитать файл с картой.")
                    .text("Возможно, он поврежден, имеет неподдерживаемую версию или не является картой.")
                    .withButton({title: "Плак", closes: true})

                overlay.show()

                console.log(e)
            }
        })

        this.selectedMap = null

        if (!this.loadMaps()) {
            let overlay = new DialogOverlay({root: $(document.body)})
            overlay.dialog
                .title("Не удалось загрузить сохраненные карты.")
                .text("Скорее всего, версия редактора изменилась и сохраненные карты не совместимы с текущей версией.")
                .withButton({title: "Плак", closes: true})

            overlay.show()
        }
    }

    loadMaps() {
        let maps = MapStorage.read()

        if (maps === null) {
            this.maps = []
            this.refreshMaps()
            return false
        }

        this.maps = maps
        this.refreshMaps()
        return true
    }

    saveMaps() {
        try {
            MapStorage.write(this.maps)
            this.refreshMaps()
        } catch (e) {
            console.log(e)
            return false
        }
        return true
    }

    updateMapTitle(map: GameMap) {
        let index = this.maps.indexOf(map)
        if (index === -1) return

        $(this.mapList.children().get(index)).find(".title").text(map.name || "Карта")
    }

    refreshMaps() {

        this.mapList.find(".map-row").remove()

        if (this.maps.length) {
            let rows = []

            this.noMapsLabel.hide()

            const self = this

            for (let map of this.maps) {
                const row = $("<div>").addClass("map-row")
                const block = $("<div>").addClass("block")

                row.append(block)
                block.append($("<div>").addClass("title").text(map.name || "Карта"))
                block.append($("<div>").addClass("size")
                    .append($("<span>").addClass("width").text(String(map.width)))
                    .append(" x ")
                    .append($("<span>").addClass("height").text(String(map.height)))
                    .append($("<span>").addClass("text").text(" блоков, "))
                    .append($("<span>").addClass("size").text(String(map.size)))
                    .append($("<span>").addClass("text").text(" байт."))
                )

                block.on("click", {
                    map: map
                }, function (event) {
                    const block = $(this)

                    block.closest(".map-list").find(".map-row .block.selected").removeClass("selected")
                    block.addClass("selected")

                    self.selected(event.data.map)
                })

                rows.push(row)
            }
            this.mapList.append(rows)
        } else {
            this.noMapsLabel.show()
        }
    }

    selected(map: GameMap) {
        if (this.selectedMap !== map) {
            this.emit("select", map)
            this.selectedMap = map
        }
    }
}