
import Entity from "src/utils/ecs/entity";

import ReactDOM from "react-dom/client"
import View from "../../view";

export interface GameOverlayConfig {
    world: Entity
}

export default class GameOverlay extends View {
    world: Entity
    reactRoot: ReactDOM.Root

    constructor(options: GameOverlayConfig) {
        super();
        this.world = options.world

        this.reactRoot = ReactDOM.createRoot(this.element[0])
    }

    setData(data: any) {}
    handleEvent(event: any) {}
}