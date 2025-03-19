import CameraPositionController from 'src/entity/components/camera-position-controller';
import Tool from '../tool';
import ToolManager from "../toolmanager";

export default class Drag extends Tool {
    oldX = 0
    oldY = 0

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/drag.png"
        this.shortcutAction = "editor-hand-tool"
    }

    becomeActive() {
        super.becomeActive()
        this.setCursor("grab")
    }

    onMouseDown(x: number, y: number) {
        super.onMouseDown(x, y)
        this.oldX = x
        this.oldY = y
        this.setCursor("grabbing")
    }

    onMouseUp(x: number, y: number) {
        super.onMouseUp(x, y)
        this.setCursor("grab")
    }

    onMouseMove(x: number, y: number): void {
        super.onMouseMove(x, y)
        if(!this.dragging) return

        let camera = this.manager.getCamera().getComponent(CameraPositionController)
        camera.target.x += this.oldX - x
        camera.target.y += this.oldY - y
        camera.onTick(0)
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        this.setCursor(null)
    }
}
