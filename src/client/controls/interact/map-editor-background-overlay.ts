import {isMacOS} from "src/utils/meta-key-name";
import Matrix3 from "src/utils/matrix3";
import Overlay from "src/client/ui/overlay/overlay";

interface GestureEvent extends UIEvent {
    scale: number
}

export default class MapEditorBackgroundOverlay extends Overlay {
    public dragging: boolean = false;
    public oldX: number = 0;
    public oldY: number = 0;
    public draggingEnabled: boolean = true;
    public oldScale: number = 1.0;
    public matrix = new Matrix3()

    constructor() {
        super()

        let overlay = this.element[0]

        overlay.addEventListener("mouseup", (event) => this.mouseUp(event))
        overlay.addEventListener("mousedown", (event) => this.mouseDown(event))
        overlay.addEventListener("mousemove", (event) => this.mouseMove(event))
        overlay.addEventListener("wheel", (event) => this.wheel(event))
        overlay.addEventListener("gesturestart", (event) => this.zoomStart(event as GestureEvent))
        overlay.addEventListener("gesturechange", (event) => this.zoomChange(event as GestureEvent))
        overlay.addEventListener("gestureend", (event) => this.zoomChange(event as GestureEvent))
    }

    zoomStart(event: GestureEvent) {
        event.preventDefault()
        this.oldScale = event.scale
    }

    zoomChange(event: GestureEvent) {
        event.preventDefault()
        if (isMacOS) {
            if (event.scale) {
                this.emit("zoom", event.scale / this.oldScale)
                this.oldScale = event.scale
            }
        }
    }

    mouseDown(event: MouseEvent) {
        event.preventDefault()
        if ((event.button === 0 && this.draggingEnabled) || event.button === 1) {
            this.dragging = true
        }

        this.oldX = event.pageX
        this.oldY = event.pageY

        this.emitMouseEvent("mousedown", event.pageX, event.pageY)
    }

    mouseUp(event: MouseEvent) {
        event.preventDefault()
        this.dragging = false

        this.emitMouseEvent("mouseup", event.pageX, event.pageY)
    }

    mouseMove(event: MouseEvent) {
        event.preventDefault()

        if (this.dragging) {
            let dx = -event.pageX + this.oldX
            let dy = -event.pageY + this.oldY

            this.emitDrag(dx, dy)
        }

        this.oldX = event.pageX
        this.oldY = event.pageY

        this.emitMouseEvent("mousemove", event.pageX, event.pageY)
    }

    private getX(x: number, y: number, z: number) {
        let normalizedX = (x / this.element.width()) * 2 - z
        let normalizedY = (y / this.element.height()) * 2 - z

        return this.matrix.transformX(normalizedX, -normalizedY, z)
    }

    private getY(x: number, y: number, z: number) {
        let normalizedX = (x / this.element.width()) * 2 - z
        let normalizedY = (y / this.element.height()) * 2 - z

        return this.matrix.transformY(normalizedX, -normalizedY, z)
    }

    private emitDrag(dx: number, dy: number) {
        this.emit("drag", this.getX(dx, dy, 0), this.getY(dx, dy, 0))
    }

    private emitMouseEvent(event: string, dx: number, dy: number) {
        this.emit(event, this.getX(dx, dy, 1), this.getY(dx, dy, 1))
    }

    wheel(event: WheelEvent) {
        event.preventDefault()
        if (event.ctrlKey) {
            if (event.deltaY)
                this.emit("zoom", 1 - (event.deltaY / 200))
        } else if (isMacOS) {
            if (event.deltaX || event.deltaY) {
                this.emitDrag(event.deltaX, event.deltaY)
            }

            if (event.deltaZ)
                this.emit("zoom", 1 + (event.deltaZ / 200))
        } else {
            this.emit("zoom", 1 - (event.deltaY / 200))
        }
    }
}