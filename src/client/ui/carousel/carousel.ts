/* @load-resource: './carousel.scss' */

import View from "src/client/ui/view";
import CarouselItem from "src/client/ui/carousel/carousel-item";

export interface CarouselConfig {
    radius: number
    angle: number
    visibleItems: number
}

export default class Carousel extends View {
    protected items: CarouselItem[] = []
    public centerIndex: number = 0
    public config: CarouselConfig
    public width: number

    constructor(config: CarouselConfig) {
        super();
        this.config = config
        if(this.config.visibleItems % 2 !== 1) {
            throw new Error("config.visibleItems must be odd number")
        }
        this.config = config
        this.element.addClass("carousel")
        this.createItems()
    }

    private createItems() {
        let halfVisibleItems = (this.config.visibleItems - 1) / 2

        for(let index = -halfVisibleItems; index <= halfVisibleItems; index++) {
            let item = this.createItem()
            item.setIndex(index)
            this.element.append(item.element)
            this.items.push(item)
        }
    }

    protected createItem() {
        return new CarouselItem(this)
    }

    private updateItemIndexIfNeeded(item: CarouselItem) {
        let limit = this.config.visibleItems / 2
        let index = item.index

        if(index - this.centerIndex > limit) {
            index -= 5 * Math.ceil((index - this.centerIndex) / this.config.visibleItems)
        } else if(index - this.centerIndex < -limit) {
            index += 5 * Math.ceil((this.centerIndex - index) / this.config.visibleItems)
        } else {
            return
        }

        item.setIndex(index)
    }

    layout() {
        this.width = this.element.width()
        for(let item of this.items) {
            this.updateItemIndexIfNeeded(item)
            item.layout()
        }
    }

    setCenterIndex(targetItemIndex: number) {
        this.centerIndex = targetItemIndex
        this.layout()
        this.emit("move")
    }
}