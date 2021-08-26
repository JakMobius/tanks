/* @load-resource: './map-preview.scss' */

import Menu from 'src/client/ui/menu/menu';

import MapStorage from 'src/client/map-editor/map-storage';
import Camera from 'src/client/camera';
import GameMap from 'src/map/game-map';
import * as Box2D from 'src/library/box2d';
import Sprite from 'src/client/sprite';
import EditorMap from "../../../../editor-map";
import MapDrawer from "src/client/graphics/drawers/map-drawer";
import Screen from "src/client/graphics/screen";

export default class MapPreviewContainer extends Menu {
	public map: EditorMap;
	public mapDrawer: MapDrawer;
	public camera: Camera;
	public noMapSelectedLabel: JQuery;
	public preview: JQuery;
	public header: JQuery<HTMLInputElement>;
	public footer: JQuery;
	public downloadButton: JQuery;
	public editButton: JQuery;
	public deleteButton: JQuery;
	public value: string;
	public canvasContainer: JQuery;
    private previewScreen: Screen;

    constructor() {
        super();

        this.element.addClass("editor-map-preview")

        this.noMapSelectedLabel =
            $("<div>").addClass("center-text-container")
                .append($("<div>").addClass("center-text")
                    .append($("<div>").addClass("large").text("Карта не выбрана"))
                    .append($("<div>").addClass("small").text("Выберите карту в меню слева"))
                )

        this.preview = $("<div>").addClass("map-preview-container")
        this.header = $("<input>").addClass("map-title") as JQuery<HTMLInputElement>
        this.footer = $("<div>").addClass("footer")

        this.downloadButton = $("<button>").addClass("large").text("Скачать").on("click", () => this.downloadMap())
        this.editButton = $("<button>").addClass("large").text("Открыть").on("click",() => this.openMap())
        this.deleteButton = $("<button>")
            .addClass("large")
            .css("background-color", "#bb2b19")
            .css("position", "absolute")
            .css("left", "6px")
            .text("Удалить")
            .on("click", () => this.deleteMap())

        this.footer.append(this.downloadButton)
        this.footer.append(this.editButton)
        this.footer.append(this.deleteButton)

        this.header.on("change", () => {
            if(this.map) {
                this.map.name = this.header.val()
                this.emit("rename-commit", this.map)
            }
        })

        this.header.on("input", () => {
            if(this.map) {
                this.map.name = this.header.val()
                this.emit("rename", this.map)
            }
        })

        this.header.on("keyup", (event: JQuery.KeyboardEventBase) => {
            if(event.originalEvent.code === "Enter") this.header.trigger("blur")
        })

        this.preview.append(this.header)
        this.preview.append(this.footer)
        this.element.append(this.preview)

        this.initCanvas()

        this.element.append(this.noMapSelectedLabel)

        this.preview.hide()
        this.noMapSelectedLabel.show()
    }

    initCanvas() {
        this.canvasContainer = $("<div>").addClass("map-canvas-container")
        this.preview.append(this.canvasContainer)

        this.previewScreen = new Screen({
            root: this.canvasContainer,
            fitRoot: false,
            width: 500,
            height: 375
        })

        Sprite.applyTexture(this.previewScreen.ctx)

        this.camera = new Camera({
            baseScale: 1,
            viewport: new Box2D.Vec2(0, 0),
            defaultPosition: new Box2D.Vec2(0, 0)
        })

        this.mapDrawer = new MapDrawer(this.previewScreen)
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

    previewMap(map: EditorMap) {
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

        this.header.trigger("blur")
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
        const ctx = this.previewScreen.ctx

        this.camera.viewport.x = this.previewScreen.width
        this.camera.viewport.y = this.previewScreen.height

        this.mapDrawer.reset()
        ctx.clear(ctx.COLOR_BUFFER_BIT)

        if(this.map != null) {
            let mapWidth = this.map.width * GameMap.BLOCK_SIZE
            let mapHeight = this.map.height * GameMap.BLOCK_SIZE

            this.camera.baseScale = Math.min(this.camera.viewport.x / mapWidth, this.camera.viewport.y / mapHeight)
            this.camera.defaultPosition.Set(mapWidth / 2, mapHeight / 2)
            this.camera.reset()
            this.camera.tick(0)
            if(this.map) this.mapDrawer.drawMap(this.map, this.camera)
        }
    }
}