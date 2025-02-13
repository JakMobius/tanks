
export interface CarouselConfig {
    visibleItems: number
    centerIndex: number
}

export interface CarouselItem {
    index: number
    position: number
}

export default class CarouselController {
    protected items: CarouselItem[] = []
    public centerIndex: number = 0
    public config: CarouselConfig

    constructor(config: CarouselConfig) {
        this.config = config
        if(this.config.visibleItems % 2 !== 1) {
            throw new Error("config.visibleItems must be odd number")
        }

        for(let i = 0; i < this.config.visibleItems; i++) {
            this.items.push({ index: i, position: 0 })
        }

        this.setCenterIndex(this.centerIndex)
    }

    private updateItemIndexIfNeeded(item: CarouselItem) {
        let limit = this.config.visibleItems / 2
        let index = item.index

        if(index - this.centerIndex > limit) {
            index -= this.config.visibleItems * Math.ceil((index - this.centerIndex) / this.config.visibleItems)
        } else if(index - this.centerIndex < -limit) {
            index += this.config.visibleItems * Math.ceil((this.centerIndex - index) / this.config.visibleItems)
        }

        item.index = index
        item.position = item.index - this.centerIndex
    }

    setCenterIndex(targetItemIndex: number) {
        this.centerIndex = targetItemIndex
        for(let item of this.items) {
            this.updateItemIndexIfNeeded(item)
        }
    }

    getItems() {
        return this.items
    }
}