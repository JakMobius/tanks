/* @load-resource: './map-preview.scss' */

const View = require("../../../../../ui/view")
const MapStorage = require("../../../../mapstorage");
const MapDrawer = require("../../../../../graphics/drawers/mapdrawer")
const Camera = require("../../../../../camera")
const GameMap = require("../../../../../../utils/map/gamemap")
const Box2D = require("../../../../../../library/box2d")
const Sprite = require("../../../../../sprite")

class MapPreviewContainer extends View {
    constructor() {
        super();

        /** @type GameMap */
        this.map = null

        /** @type MapDrawer */
        this.mapDrawer = null

        /** @type HTMLCanvasElement */
        this.canvas = null

        /** @type WebGLRenderingContextBase */
        this.ctx = null

        /** @type Camera */
        this.camera = null

        this.element.addClass("menu editor-map-preview")

        this.noMapSelectedLabel =
            $("<div>").addClass("center-text-container")
                .append($("<div>").addClass("center-text")
                    .append($("<div>").addClass("large").text("Карта не выбрана"))
                    .append($("<div>").addClass("small").text("Выберите карту в меню слева"))
                )

        this.preview = $("<div>").addClass("map-preview-container")
        this.header = $("<input>").addClass("map-title")
        this.footer = $("<div>").addClass("footer")

        this.downloadButton = $("<button>").text("Скачать").click(() => this.downloadMap())
        this.editButton = $("<button>").text("Открыть").click(() => this.openMap())
        this.deleteButton = $("<button>")
            .css("background-color", "#bb2b19")
            .css("position", "absolute")
            .css("left", "6px")
            .text("Удалить")
            .click(() => this.deleteMap())

        this.footer.append(this.downloadButton)
        this.footer.append(this.editButton)
        this.footer.append(this.deleteButton)

        const self = this

        this.header.on("change", function() {
            if(self.map) {
                self.map.name = this.value
                self.emit("rename-commit", self.map)
            }
        })

        this.header.on("input", function() {
            if(self.map) {
                self.map.name = this.value
                self.emit("rename", self.map)
            }
        })

        this.header.on("keyup", (event) => {
            if(event.originalEvent.code === "Enter") this.header.blur()
        })

        this.initCanvas()
        this.preview.append(this.header)
        this.preview.append(this.footer)
        this.element.append(this.preview)

        this.element.append(this.noMapSelectedLabel)

        this.preview.hide()
        this.noMapSelectedLabel.show()
    }

    initCanvas() {
        this.canvasContainer = $("<div>").addClass("map-canvas-container")
        this.canvas = document.createElement("canvas")
        this.canvas.classList.add("map-preview-canvas")
        this.canvasContainer.append($(this.canvas))
        this.preview.append(this.canvasContainer)

        this.ctx = this.canvas.getContext("webgl")
        this.ctx.clearColor(1.0, 1.0, 1.0, 1.0);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
        this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
        this.ctx.enable(this.ctx.BLEND);

        Sprite.applyTexture(this.ctx, 0)

        this.camera = new Camera({
            baseScale: 1,
            viewport: new Box2D.b2Vec2(this.canvas.clientWidth, this.canvas.clientHeight),
            defaultPosition: new Box2D.b2Vec2(0, 0)
        })

        this.mapDrawer = new MapDrawer(this.camera, this.ctx)
    }

    deleteMap() {
        this.emit("delete", this.map)
    }

    openMap() {
        this.emit("open", this.map)
    }

    downloadMap() {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";

        let data = MapStorage.writeMap(this.map, [
            GameMap.BinaryOptions.SIZE_FLAG,
            GameMap.BinaryOptions.DATA_FLAG,
            GameMap.BinaryOptions.SPAWN_ZONES_FLAG
        ])

        const blob = new Blob([data], { type: "octet/stream" })
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = this.map.name + ".map";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove()
    }

    previewMap(map) {
        if (!!map !== !!this.map) {
            if (map) {
                this.preview.show()
                this.noMapSelectedLabel.hide()
            } else {
                this.preview.hide()
                this.noMapSelectedLabel.show()
            }
        }

        if(map && map.needsUpdate) {
            map.update()
        }

        this.header.blur()
        this.map = map
        if(this.map) {
            if(this.map.name)
                this.header.val(this.map.name)
            else this.header.val("Карта")
        } else {
            this.header.val("")
        }
        this.drawMap()
    }

    drawMap() {
        this.mapDrawer.reset()
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT)

        if(this.map != null) {
            if(this.camera.viewport.x === 0) {
                this.camera.viewport.x = this.canvas.clientWidth
                this.camera.viewport.y = this.canvas.clientHeight
                this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio
                this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio
                this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);
            }

            let mapWidth = this.map.width * GameMap.BLOCK_SIZE
            let mapHeight = this.map.height * GameMap.BLOCK_SIZE

            this.camera.baseScale = Math.min(this.camera.viewport.x / mapWidth, this.camera.viewport.y / mapHeight)
            this.camera.defaultPosition.Set(mapWidth / 2, mapHeight / 2)
            this.camera.reset()
            this.camera.tick(0)
            this.mapDrawer.draw(this.map)
        }
    }
}

module.exports = MapPreviewContainer