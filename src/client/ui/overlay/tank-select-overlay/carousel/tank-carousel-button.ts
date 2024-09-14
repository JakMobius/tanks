/* @load-resource: './tank-carousel-button.scss' */

import View from "src/client/ui/view";

export default class TankCarouselButton extends View {

    animationTimeout: number | null = null

    constructor() {
        super();
        this.element.addClass("tank-carousel-button")
    }

    left() {
        this.element.addClass("tank-carousel-button-left")
        return this
    }

    right() {
        this.element.addClass("tank-carousel-button-right")
        return this
    }

    trigger() {
        if(this.animationTimeout) {
            clearTimeout(this.animationTimeout)
            this.animationTimeout = null
            this.element.removeClass("tank-carousel-button-active")
            this.element.height() // Trigger reflow
        }

        this.animationTimeout = window.setTimeout(() => {
            this.element.removeClass("tank-carousel-button-active")
        }, 200)

        this.element.addClass("tank-carousel-button-active")
    }
}