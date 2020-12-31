
import DocumentEventHandler from './documenteventhandler';

class TouchController extends DocumentEventHandler {
	public touchData: any;
	public handler: any;
	public canvas: any;

    constructor(handler, canvas) {
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

    ontouchstart(event) {
        const rect = this.canvas.getBoundingClientRect();

        for(let touch of event.changedTouches) {
            const left = touch.pageX - document.body.scrollLeft - rect.x;
            const top = touch.pageY - document.body.scrollTop - rect.y;
            const bottom = rect.height - top;
            const right = rect.width - left;

            const struct = {
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

    ontouchmove(event) {
        const rect = this.canvas.getBoundingClientRect();

        for(let e of event.changedTouches) {
            const touch = this.touchData.get(e.identifier);

            if (!touch) return

            const left = e.pageX - document.body.scrollLeft - rect.x;
            const top = e.pageY - document.body.scrollTop - rect.y;
            const bottom = rect.height - top;
            const right = rect.width - left;

            touch.left = left
            touch.top = top
            touch.right = right
            touch.bottom = bottom

            touch.captured.touchMoved(touch)
        }

        event.preventDefault()
    };

    ontouchend(event) {

        for(let e of event.changedTouches) {
            const touch = this.touchData.get(e.identifier);

            if (!touch) return

            touch.captured.touchEnded(touch)
            this.touchData.delete(e.identifier)
        }

        event.preventDefault()
    };
}

export default TouchController;