import Overlay from "src/client/ui/overlay/overlay";
import Entity from "src/utils/ecs/entity";

export interface GameOverlayConfig {
    world: Entity
}

export default class GameOverlay extends Overlay {
    world: Entity

    constructor(options: GameOverlayConfig) {
        super();
        this.world = options.world
    }

    setData(data: any) {}
    handleEvent(event: any) {}
}