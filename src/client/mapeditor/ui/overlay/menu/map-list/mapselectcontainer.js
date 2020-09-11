/* @load-resource: './map-list.scss' */

const View = require("../../../../../ui/view")
const MapStorage = require("../../../../mapstorage")
const DragListener = require("../../../element/dragoverlay")
const Utils = require("../../../../../../utils/utils");

class MapSelectContainer extends View {
    constructor(options) {
        super(options);

        this.element.addClass("menu editor-map-list")

        this.noMapsLabel =
            $("<div>").addClass("center-text-container")
                .append($("<div>").addClass("center-text")
                    .append($("<div>").addClass("large").text("Нет карт"))
                    .append($("<div>").addClass("small").text("Создайте новую карту или перетяните файл в это окно"))
                )

        this.mapContainer = $("<div>").addClass("map-list-container")
        this.mapList = $("<div>").addClass("map-list")
        this.footer = $("<div>").addClass("footer")
        this.createNewMapButton = $("<button>").text("Создать новую карту").click(() => this.emit("create"))

        this.mapContainer.append(this.mapList)
        this.element.append(this.mapContainer)
        this.element.append(this.footer)
        this.footer.append(this.createNewMapButton)
        this.mapContainer.append(this.noMapsLabel)

        this.maps = []

        this.dragListener = new DragListener(this.element)
        this.element.append(this.dragListener.element)
        this.dragListener.startListening()
        this.dragListener.on("file", (file) => {
            try {
                let map = MapStorage.readMap(file.buffer)

                if(!map.name) map.name = Utils.trimFileExtension(file.name)

                this.maps.push(map)

                this.saveMaps()
            } catch(e) {
                console.error(e)
            }
        })

        this.selectedMap = null

        this.loadMaps()
    }

    loadMaps() {
        this.maps = MapStorage.read()

        this.refreshMaps()
    }

    saveMaps() {
        try {
            MapStorage.write(this.maps)
            this.refreshMaps()
        } catch(e) {
            console.error(e)
            return false
        }
        return true
    }

    updateMapTitle(map) {
        let index = this.maps.indexOf(map)
        if(index === -1) return

        $(this.mapList.children().get(index)).find(".title").text(map.name || "Карта")
    }

    refreshMaps() {

        this.mapList.find(".map-row").remove()

        if(this.maps.length) {
            this.noMapsLabel.hide()

            const self = this

            for(let map of this.maps) {
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

                block.click({
                    map: map
                }, function(event) {
                    const block = $(this)

                    block.closest(".map-list").find(".map-row .block.selected").removeClass("selected")
                    block.addClass("selected")

                    self.selected(event.data.map)
                })

                this.mapList.append(row)
            }
        } else {
            this.noMapsLabel.show()
        }
    }

    selected(map) {
        if(this.selectedMap !== map) {
            this.emit("select", map)
            this.selectedMap = map
        }
    }
}

module.exports = MapSelectContainer