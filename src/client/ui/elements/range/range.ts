import './range.scss'

import View from '../../view';

class RangeView extends View {
	public thumb: JQuery;
	public track: JQuery;
	public thumbContainer: JQuery;
	public value: number;
	public dragging: boolean;
	public oldX: number;
	public dragX: number;
	public trackWidth: number;

    constructor() {
        super();

        this.element.addClass("range-input")

        this.thumb = $("<div>").addClass("thumb")
        this.track = $("<div>").addClass("track")
        this.thumbContainer = $("<div>").addClass("thumb-container")

        this.thumbContainer.append(this.thumb)
        this.element.append(this.thumbContainer)
        this.element.append(this.track)

        this.value = 0
        this.dragging = false

        this.oldX = 0
        this.dragX = 0

        this.thumb.on("mousedown", (e) => {
            if(e.which !== 1) return

            this.oldX = e.pageX
            this.dragging = true
            this.trackWidth = this.track.width()
        })
        document.addEventListener("mouseup", (e) => {
            if(!this.dragging) return
            if(e.which !== 1) return

            this.dragX = this.getPosition()
            this.dragging = false
        })
        document.addEventListener("mousemove", (e) => {
            if(!this.dragging) return

            this.dragX += e.pageX - this.oldX; this.oldX = e.pageX
            this.setValue(this.getPosition() / this.trackWidth)
            this.emit("value", this.value)
        })
    }

    setValue(value: number) {
        this.value = value
        this.thumb.css("left", (value * 100).toFixed(2) + "%")
    }

    getValue() {
        return this.value
    }

    getPosition() {
        return Math.min(this.trackWidth, Math.max(this.dragX, 0))
    }
}

export default RangeView;