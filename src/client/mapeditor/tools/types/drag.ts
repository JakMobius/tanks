
import Tool from '../tool';

class Drag extends Tool {
    constructor(scene) {
        super(scene);

        this.image = "../assets/mapeditor/drag.png"
        this.locksDragging = false
    }

    becomeActive() {
        this.setCursor("grab")
    }

    mouseDown(x, y) {
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