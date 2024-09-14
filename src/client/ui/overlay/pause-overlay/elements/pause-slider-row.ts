/* @load-resource: ./pause-slider-row.scss */

import View from "src/client/ui/view";
import {clamp} from "src/utils/utils";

export default class PauseSliderRow extends View {
    descriptionBlock = $("<div>").addClass("slider-description")
    valueBlock = $("<div>").addClass("slider-value")

    scale = $("<div>").addClass("slider-scale")
    antiScale = $("<div>").addClass("slider-anti-scale")

    textContainer = $("<div>").addClass("slider-text-container")

    min: number
    max: number
    value: number

    scaleClicked = false

    mouseUpHandler = (event: MouseEvent) => this.onMouseUp(event)
    mouseMoveHandler = (event: MouseEvent) => this.onMouseMove(event)

    constructor(text: string, min: number, max: number) {
        super();
        this.element.addClass("pause-slider-row")

        this.descriptionBlock.text(text)

        this.textContainer.append(this.descriptionBlock)
        this.textContainer.append(this.valueBlock)

        this.element.append(this.scale)
        this.element.append(this.antiScale)
        this.element.append(this.textContainer)

        this.element.on("mousedown", (e) => this.onMouseDown(e))

        this.min = min
        this.max = max
    }

    setValue(value: number) {
        this.value = value
        this.updateScale()
        this.emit("value-changed", this.value)
        return this
    }

    private updateScale() {
        let percent = (this.value - this.min) / (this.max - this.min) * 100
        this.scale.css("width", percent + "%")
        this.antiScale.css("width", (100 - percent) + "%")
        this.valueBlock.text(Math.round(this.value))
    }

    private onMouseDown(e: JQuery.MouseDownEvent) {
        this.scaleClicked = true
        document.body.addEventListener("mouseup", this.mouseUpHandler)
        document.body.addEventListener("mousemove", this.mouseMoveHandler)
        this.handleScaleClick(e.pageX - this.element.offset().left)
    }

    private onMouseUp(e: MouseEvent) {
        if(this.scaleClicked) {
            document.body.removeEventListener("mouseup", this.mouseUpHandler)
            document.body.removeEventListener("mousemove", this.mouseMoveHandler)
            this.scaleClicked = false
            this.handleScaleClick(e.pageX - this.element.offset().left)
        }
    }

    private onMouseMove(e: MouseEvent) {
        if(this.scaleClicked) {
            this.handleScaleClick(e.pageX - this.element.offset().left)
        }
    }

    private handleScaleClick(offsetX: number) {
        let percent = offsetX / this.element.width()
        percent = clamp(percent, 0, 1)
        this.setValue(this.min + (this.max - this.min) * percent)
        this.updateScale()
    }
}