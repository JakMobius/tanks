
import Tool from '../tool';
import ToolManager from "../toolmanager";

class Drag extends Tool {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/mapeditor/drag.png"
        this.locksDragging = false
    }

    becomeActive() {
        this.setCursor("grab")
    }

    mouseDown(x: number, y: number) {
        super.mouseUp()
        this.setCursor("grabbing")
    }

    mouseUp() {
        this.setCursor("grab")
    }

    resignActive() {
        this.setCursor(null)
    }
}

export default Drag;