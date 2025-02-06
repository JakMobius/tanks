import Tool from '../tool';
import ToolManager from "../toolmanager";

export default class Drag extends Tool {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/drag.png"
        this.locksDragging = false
    }

    becomeActive() {
        super.becomeActive()
        this.setCursor("grab")
    }

    mouseDown(x: number, y: number) {
        super.mouseUp(x, y)
        this.setCursor("grabbing")
    }

    mouseUp() {
        this.setCursor("grab")
    }

    resignActive() {
        this.setCursor(null)
    }
}
