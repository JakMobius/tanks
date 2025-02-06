import "./cloud.scss"
import View from "src/client/ui/view";

export default class Cloud extends View {
    constructor(text?: string) {
        super();
        if(text) this.element.text(text)
        this.element.addClass("cloud")
    }

    button(enable: boolean = true) {
        this.checkClass("button", enable)

        if(enable) this.element.attr("role", "button")
        else this.element.attr("role", "")

        return this
    }

    stretch(enable: boolean = true) {
        this.checkClass("stretch", enable)
        return this
    }

    red(enable: boolean = true) {
        this.checkClass("red", enable)
        return this
    }

    blue(enable: boolean = true) {
        this.checkClass("blue", enable)
        return this
    }

    round(enable: boolean = true) {
        this.checkClass("round", enable)
        return this
    }

    text(text: string) {
        this.element.text(text)
        return this
    }

    customClass(clazz: string) {
        this.element.addClass(clazz)
        return this
    }

    leftArrowed(enable: boolean = true) {
        this.checkClass("left-arrowed", enable)
        return this
    }

    protected checkClass(className: string, enable: boolean) {
        if(enable) this.element.addClass(className)
        else this.element.removeClass(className)
    }
}