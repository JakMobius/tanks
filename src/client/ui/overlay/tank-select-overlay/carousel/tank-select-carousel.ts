/* @load-resource: './tank-select-carousel.scss' */

import TankCarouselItem from "src/client/ui/overlay/tank-select-overlay/carousel/tank-carousel-item";
import Carousel from "src/client/ui/carousel/carousel";
import {tankDescriptions} from "src/client/ui/overlay/tank-select-overlay/tank-descriptions";

export default class TankSelectCarousel extends Carousel {

    targetCenterIndex: number = 0

    constructor() {
        super({
            radius: 800,
            angle: 15 / 180 * Math.PI,
            visibleItems: 5
        });

        this.element.addClass("tank-select-carousel")
    }

    protected createItem() {
        let item = new TankCarouselItem(this)

        item.element.on("click", () => {
            if(this.targetCenterIndex === item.index) {
                this.emit("confirm", item.index)
            } else {
                this.targetCenterIndex = item.index
            }
        })

        return item
    }

    private carouselAnimationFrame(dt: number) {
        let delta = this.targetCenterIndex - this.centerIndex
        if(delta == 0) {
            return
        }

        if(Math.abs(delta) < 0.001) {
            this.setCenterIndex(this.targetCenterIndex)
            return
        }

        let animationStep = delta - delta * Math.exp(-dt * 15)

        this.setCenterIndex(this.centerIndex + animationStep)
    }

    getTankForIndex(item: number) {
        let tankIndex = item % tankDescriptions.length
        if(tankIndex < 0) tankIndex += tankDescriptions.length
        return tankDescriptions[tankIndex]
    }

    // When centerIndex is not an integer, there are two tanks in the center.
    // This function returns the one that is closer to the center.
    getNearTank() {
        return this.getTankForIndex(Math.round(this.centerIndex))
    }

    // When centerIndex is not an integer, there are two tanks in the center.
    // This function returns the one that is farther from the center.
    getFarTank() {
        let rounded = Math.round(this.centerIndex)
        if(this.centerIndex - rounded > 0) {
            return this.getTankForIndex(rounded + 1)
        } else {
            return this.getTankForIndex(rounded - 1)
        }
    }

    indexDistanceToNearestTank() {
        return Math.abs(this.centerIndex - Math.round(this.centerIndex))
    }

    onFrame(dt: number) {
        this.carouselAnimationFrame(dt)
        for(let item of this.items) {
            let carouselItem = item as TankCarouselItem
            carouselItem.tankPreviewCanvas.onFrame(dt)
        }
    }
}