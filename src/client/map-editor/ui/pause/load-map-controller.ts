import './load-map-controller.scss'

import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import View from "src/client/ui/view";
import MapStorage from "src/client/map-editor/map-storage";
import GameMap from "src/map/game-map";
import GameMapNameComponent from "src/client/map-editor/map-name-component";
import GameMapSizeComponent from "src/client/map-editor/map-size-component";

export class MapPreviewRow extends View {
    previewContainer = $("<div>").addClass("map-preview-container")
    previewCanvas = $("<canvas>")
    description = $("<div>").addClass("map-description")
    descriptionTitle = $("<div>").addClass("map-description-title")
    descriptionSubtitle = $("<div>").addClass("map-description-subtitle")
    buttonsContainer = $("<div>").addClass("map-buttons-container")

    openButton = $("<div>").addClass("open-button").text("Открыть")

    constructor() {
        super();
        this.element.addClass("map-preview-row")

        this.previewContainer.append(this.previewCanvas)
        this.description.append(this.descriptionTitle, this.descriptionSubtitle)

        this.buttonsContainer.append(this.openButton)

        this.element.append(this.previewContainer, this.description, this.buttonsContainer)
    }

    setMap(map: GameMap) {
        let name = map.getComponent(GameMapNameComponent)?.name ?? "Карта"
        let size = map.getComponent(GameMapSizeComponent)?.size ?? -1

        this.descriptionTitle.text(name)
        this.descriptionSubtitle.text(size + " байт • изм. 10.02.2024 14:23")
    }
}

export class MainView extends PauseMenuView {
    rows: MapPreviewRow[] = []

    constructor(controller: LoadMapController) {
        super(controller);
        this.addSubtitle("Чтобы загрузить карту из файла, просто перетащите его в окно с редактором.")
        this.reload()
    }

    reload() {
        let maps = MapStorage.read()

        while (this.rows.length) {
            this.rows[this.rows.length - 1].element.remove()
        }

        let rows = maps.map((map) => {
            let row = new MapPreviewRow()
            row.setMap(map)
            this.element.append(row.element)
            return row
        })

        this.rows = rows
    }
}

export default class LoadMapController extends PauseViewController {
    constructor() {
        super();
        this.title = "Загрузить карту"
        this.view = new MainView(this)
    }
}