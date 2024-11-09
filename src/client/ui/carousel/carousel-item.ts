/* @load-resource: './carousel-item.scss' */

import View from "src/client/ui/view";
import Carousel from "src/client/ui/carousel/carousel";

export default class CarouselItem extends View {
    index: number
    carousel: Carousel

    constructor(carousel: Carousel) {
        super();
        this.carousel = carousel
        this.element.addClass("carousel-item");
    }

    setIndex(index: number) {
        this.index = index
    }

    opacityFunction(distance: number) {
        return Math.max((1 - distance) / (1 + distance), 0)
    }

    scaleFunction(distance: number) {
        return 1 - (1 - this.opacityFunction(distance)) * 0.5
    }

    layout() {
        const carouselRadius = this.carousel.config.radius
        const carouselWidth = this.carousel.width
        const carouselAngle = this.carousel.config.angle
        const carouselVisibleItems = this.carousel.config.visibleItems
        const selfWidth = this.element.width()
        const offset = this.index - this.carousel.centerIndex

        let angle = offset * carouselAngle
        let angleLimit = carouselVisibleItems * carouselAngle * 0.5

        let offsetX = Math.sin(angle) * carouselRadius;
        let offsetY = -Math.cos(angle) * carouselRadius + carouselRadius;

        let left = offsetX + carouselWidth / 2 - selfWidth / 2;
        let top = offsetY

        let distance = Math.min(Math.abs(angle) / angleLimit, 1)

        let opacity = this.opacityFunction(distance)
        let scale = this.scaleFunction(distance)

        this.element.css({
            left: left + "px",
            top: top + "px",
            transform: "scale(" + scale + ", " + scale + ") rotate(" + angle + "rad)",
            opacity: opacity
        })
    }
}