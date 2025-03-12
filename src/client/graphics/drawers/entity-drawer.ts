import DrawPhase from "./draw-phase";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export default class EntityDrawer extends EventHandlerComponent {
    public enabled: boolean = true

    drawCallback = (phase: DrawPhase) => this.draw(phase)

    cameras = new Set<Entity>()

    constructor() {
        super()
        this.eventHandler.on("camera-attach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).entityDrawPhase.on("draw", this.drawCallback)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).entityDrawPhase.off("draw", this.drawCallback)
        })
    }

    /**
     * Draws the specified entity.
     */

    draw(phase: DrawPhase) {
    }
}