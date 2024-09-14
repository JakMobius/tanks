/* @load-resource: "./autoresize-input.scss" */

import View from "src/client/ui/view";

export default class AutoresizeInput extends View {
    input = $("<input>")
    span = $("<span>")

    observer = new ResizeObserver(entries => {
        for(let entry of entries){
            let width = entry.contentBoxSize[0].inlineSize
            this.element.css("width", width + "px")
        }
    })

    constructor() {
        super()
        this.element.addClass("autoresize-input")
        this.element.append(this.span, this.input)
        this.element.on("input", () => this.updateSpan())
        this.observer.observe(this.span[0])
    }

    updateSpan() {
        let value = this.input.val().toString()
        if(!value) {
            value = this.input.attr("placeholder") ?? ""
        }
        this.span[0].textContent = value
    }

    setValue(value: string) {
        this.input.val(value)
        this.updateSpan()
    }

    getValue() {
        return this.input.val().toString()
    }

    setPlaceholder(value: string) {
        this.input.attr("placeholder", value)
        this.updateSpan()
    }

    getPlaceholder() {
        return this.input.attr("placeholder")
    }
}