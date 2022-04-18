import DocumentEventHandler from './document-event-handler';

export default class DragHandler extends DocumentEventHandler {
	public dragging: any;
	public oldX: any;
	public oldY: any;
	public isMacOS: any;
	public draggingEnabled: any;
	public oldScale: any;

    constructor(target: HTMLElement) {
        super()

        this.target = target
        this.dragging = false
        this.oldX = 0
        this.oldY = 0

        this.isMacOS = navigator.userAgent.indexOf("Mac") !== -1
        this.draggingEnabled = true
        this.oldScale = 1
    }

    startListening() {
        this.bind("mouseup", this.mouseUp)
        this.bind("mousedown", this.mouseDown)
        this.bind("mousemove", this.mouseMove)
        this.bind("wheel", this.wheel)
        this.bind('gesturestart', this.zoomStart)
        this.bind('gesturechange', this.zoomChange)
        this.bind('gestureend', this.zoomChange)
    }

    zoomStart(event: MSGestureEvent) {
        event.preventDefault()
        this.oldScale = event.scale
    }

    zoomChange(event: MSGestureEvent) {
        event.preventDefault()
        if(this.isMacOS) {
            if(event.scale) {
                this.emit("zoom", event.scale / this.oldScale)
                this.oldScale = event.scale
            }
        }
    }

    mouseDown(event: MouseEvent) {
        event.preventDefault()
        if((event.button === 0 && this.draggingEnabled) || event.button === 1) {
            this.dragging = true
        }

        this.oldX = event.pageX
        this.oldY = event.pageY
    }

    mouseUp(event: MouseEvent) {
        event.preventDefault()
        this.dragging = false
    }

    mouseMove(event: MouseEvent) {
        event.preventDefault()

        if(this.dragging) {
            let dx = event.pageX - this.oldX
            let dy = event.pageY - this.oldY

            this.emit("drag", -dx, -dy)
        }

        this.oldX = event.pageX
        this.oldY = event.pageY
    }

    wheel(event: WheelEvent) {
        event.preventDefault()
        if(event.ctrlKey) {
            if(event.deltaY)
                this.emit("zoom", 1 - (event.deltaY / 200))
        } else if(this.isMacOS) {
            if(event.deltaX || event.deltaY)
                this.emit("drag", event.deltaX, event.deltaY)

            if(event.deltaZ)
                this.emit("zoom", 1 + (event.deltaZ / 200))
        } else {
            this.emit("zoom", 1 - (event.deltaY / 200))
        }
    }
}