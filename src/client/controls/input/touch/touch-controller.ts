import DocumentEventHandler from '../../interact/document-event-handler';
import Vidget from "./vidget";
import ControlPanel from "../../../game/ui/control-panel";

export interface Touch {
    left: number,
    top: number,
    bottom: number,
    right: number,
    id: number,
    vidget?: Vidget
    captured?: ControlPanel
}

class TouchController extends DocumentEventHandler {
	public touchData = new Map<number, Touch>();
	public handler: ControlPanel;
	public canvas: HTMLCanvasElement;

    constructor(handler: ControlPanel, canvas: HTMLCanvasElement) {
        super()
        this.touchData = new Map();
        this.handler = handler
        this.canvas = canvas
        this.target = this.canvas
    }

    startListening() {
        this.bind("touchstart", this.ontouchstart)
        this.bind("touchmove", this.ontouchmove)
        this.bind("touchend", this.ontouchend)
    }

    ontouchstart(event: TouchEvent) {
        const rect = this.canvas.getBoundingClientRect();

        for(let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i]
            const left = touch.pageX - document.body.scrollLeft - rect.x;
            const top = touch.pageY - document.body.scrollTop - rect.y;
            const bottom = rect.height - top;
            const right = rect.width - left;

            const struct: Touch = {
                left: left,
                top: top,
                bottom: bottom,
                right: right,
                id: touch.identifier
            };

            if (this.handler.captureTouch(struct)) {
                for (let [id, anotherTouch] of this.touchData.entries()) {
                    if (struct.id !== id) {
                        if (struct.vidget.id === anotherTouch.vidget.id) {
                            this.touchData.delete(anotherTouch.id)
                        }
                    }
                }

                this.touchData.set(touch.identifier, struct)
            }
        }

        event.preventDefault()
    };

    ontouchmove(event: TouchEvent) {
        const rect = this.canvas.getBoundingClientRect();

        for(let i = 0; i < event.changedTouches.length; i++) {
            let changedTouch = event.changedTouches[i]
            const touch = this.touchData.get(changedTouch.identifier);

            if (!touch) return

            const left = changedTouch.pageX - document.body.scrollLeft - rect.x;
            const top = changedTouch.pageY - document.body.scrollTop - rect.y;
            const bottom = rect.height - top;
            const right = rect.width - left;

            touch.left = left
            touch.top = top
            touch.right = right
            touch.bottom = bottom

            if(touch.captured) touch.captured.touchMoved(touch)
        }

        event.preventDefault()
    };

    ontouchend(event: TouchEvent) {

        for(let i = 0; i < event.changedTouches.length; i++) {
            let changedTouch = event.changedTouches[i]
            const touch = this.touchData.get(changedTouch.identifier);

            if (!touch) return

            touch.captured.touchEnded(touch)
            this.touchData.delete(changedTouch.identifier)
        }

        event.preventDefault()
    };
}

export default TouchController;