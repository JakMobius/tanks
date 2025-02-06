import './tank-carousel-item.scss'

import TankPreviewCanvas from "src/client/ui/overlay/tank-select-overlay/tank-preview-canvas";
import TankSelectCarousel from "src/client/ui/overlay/tank-select-overlay/carousel/tank-select-carousel";
import CarouselItem from "src/client/ui/carousel/carousel-item";

export default class TankCarouselItem extends CarouselItem {
    tankPreviewCanvas: TankPreviewCanvas

    constructor(carousel: TankSelectCarousel) {
        super(carousel);
        this.element.addClass("tank-carousel-item");
        this.tankPreviewCanvas = new TankPreviewCanvas();
        this.element.append(this.tankPreviewCanvas.element)
    }

    setIndex(index: number) {
        super.setIndex(index);
        let carousel = this.carousel as TankSelectCarousel
        let tank = carousel.getTankForIndex(this.index)
        this.tankPreviewCanvas.setTankType(tank.type)
    }
}