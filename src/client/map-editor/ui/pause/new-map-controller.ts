import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PauseInputRow from "src/client/ui/overlay/pause-overlay/elements/pause-input-row";
import NavigationCloud from "src/client/game/ui/cloud/navigation-cloud";

export class MainView extends PauseMenuView {
    mapNameRow = new PauseInputRow().small()
    widthInputRow = new PauseInputRow().small()
    heightInputRow = new PauseInputRow().small()
    submitButton: NavigationCloud

    mapName: string | null
    mapWidth: number | null
    mapHeight: number | null

    constructor(controller: NewMapController) {
        super(controller);

        this.mapNameRow.title.blue().text("Название")
        this.mapNameRow.input.blue().setPlaceholder("Безымянная карта")

        this.widthInputRow.title.blue().text("Ширина")
        this.widthInputRow.input
            .blue()
            .setPlaceholder("50")
            .setSuffix(" блоков")

        this.heightInputRow.title.blue().text("Высота")
        this.heightInputRow.input
            .blue()
            .setPlaceholder("50")
            .setSuffix(" блоков")

        this.widthInputRow.input.element.on("input", () => {
            this.mapWidth = this.verifySizeRow(this.widthInputRow)
            this.verifyForm()
        })

        this.heightInputRow.input.element.on("input", () => {
            this.mapHeight = this.verifySizeRow(this.heightInputRow)
            this.verifyForm()
        })

        this.mapNameRow.input.element.on("input", () => {
            this.mapName = this.verifyNameRow(this.mapNameRow)
            this.verifyForm()
        })

        this.element.append(this.mapNameRow.element)
        this.element.append(this.widthInputRow.element)
        this.element.append(this.heightInputRow.element)
        this.submitButton = this.addButton("Создать")

        this.mapWidth = this.verifySizeRow(this.widthInputRow)
        this.mapHeight = this.verifySizeRow(this.heightInputRow)
        this.verifyForm()
    }

    private verifySizeRow(row: PauseInputRow) {
        let size = row.input.getValue()
        if (size.length === 0) size = row.input.getPlaceholder()

        let number = null
        let isNumber = size.match(/^-?\d+$/)
        if (isNumber) {
            number = parseInt(size)
            if (number < 1) number = null
            if (number > 256) number = null
        }

        let sizeValid = number !== null

        row.input.red(!sizeValid)
        row.input.blue(sizeValid)

        return number
    }

    private verifyNameRow(row: PauseInputRow) {
        let name = row.input.getValue()
        if (name.length === 0) name = row.input.getPlaceholder()

        if(name.length > 24) name = null

        let sizeValid = name !== null

        row.input.red(!sizeValid)
        row.input.blue(sizeValid)

        return name
    }

    private verifyForm() {
        let formValid = this.mapWidth !== null && this.mapHeight !== null && this.mapName !== null

        this.submitButton.blue(formValid)
    }
}

export default class NewMapController extends PauseViewController {
    constructor() {
        super();
        this.title = "Новая карта"
        this.view = new MainView(this)
    }
}