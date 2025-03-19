import ToolManager from "./toolmanager";
import { ControlsResponder } from "src/client/controls/root-controls-responder";
import EventEmitter from "src/utils/event-emitter";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform/transform-component";

export default class Tool extends EventEmitter {
	public dragging: boolean
	public cursor: string
	public settingsView: React.FC | null
    public shortcutAction: string | null = null
    public controlsResponder = new ControlsResponder().setFlat(true)

    /**
     * Path to tool icon
     */
    image: string | null = null

    /**
     * Localized tool name
     */
    name: string | null = null

    /**
     * Tool manager associated with this tool
     */
    manager: ToolManager = null

    constructor(manager: ToolManager) {
        super()
        this.image = null
        this.manager = manager
        this.name = null
        this.dragging = false
        this.cursor = null
        this.settingsView = null
    }

    setCursor(cursor: string): void {
        if(this.cursor === cursor) return
        this.cursor = cursor
        this.manager.updateCursor()
    }

    onMouseDown(x: number, y: number): void {
        this.dragging = true
    }

    onMouseMove(x: number, y: number): void {

    }

    onMouseUp(x: number, y: number): void {
        this.dragging = false
    }

    onDrag(dx: number, dy: number) {
        let camera = this.manager.getCamera().getComponent(CameraPositionController)
        camera.target.x += dx
        camera.target.y += dy
        camera.onTick(0)
        this.manager.setNeedsRedraw()
    }

    onZoom(zoom: number, x: number, y: number) {
        let camera = this.manager.getCamera()
        let cameraPositionController = camera.getComponent(CameraPositionController)
        let cameraMatrix = camera.getComponent(TransformComponent).getGlobalTransform()
        let rightX = cameraMatrix.transformX(1, 0, 0)
        let rightY = cameraMatrix.transformY(1, 0, 0)
        let topX = cameraMatrix.transformX(0, -1, 0)
        let topY = cameraMatrix.transformY(0, -1, 0)

        let coef = 1 - (1 / zoom)
        let moveX = (rightX + topX) * x * coef
        let moveY = (rightY + topY) * y * coef

        cameraPositionController.baseScale *= zoom
        cameraPositionController.target.x += moveX
        cameraPositionController.target.y += moveY
        cameraPositionController.onTick(0)
        this.manager.setNeedsRedraw()
    }

    becomeActive(): void {
        this.controlsResponder.setParentResponder(this.manager.getControlsResponder())
    }

    resignActive(): void {
        this.controlsResponder.setParentResponder(null)
    }

    trace(x1: number, y1: number, x2: number, y2: number, callback: (x: number, y: number) => void) {
        let dx = x2 - x1
        let dy = y2 - y1

        callback(x1, y1)

        if(dx === 0 && dy === 0) {
            return
        }

        let adx = Math.abs(dx);
        let ady = Math.abs(dy);

        let sx = dx > 0
        let sy = dy > 0

        if(adx > ady) {
            dx /= adx;
            dy /= adx;
        } else {
            dx /= ady;
            dy /= ady;
        }

        let x = x1
        let y = y1

        while(true) {
            callback(Math.floor(x), Math.floor(y))
            x += dx
            y += dy
            if((dx !== 0 && x !== x2 && (x > x2) === sx) || (dy !== 0 && y !== y2 && (y > y2) === sy)) break;
        }
    }

    getOnlySelectedEntity() {
        return this.manager.getOnlySelectedEntity()
    }

    getSelectedEntities() {
        return this.manager.getSelectedEntities()
    }

    setImage(image: string) {
        this.image = image
        this.emit("image-set")
    }

    isSuitable() {
        return true
    }
}