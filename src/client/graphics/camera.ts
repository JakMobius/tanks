import Entity from "src/utils/ecs/entity";
import EntityContextProvider from "src/utils/ecs/entity-context-provider";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class CameraComponent extends EventHandlerComponent {
    viewport = { x: 0, y: 0 }

    constructor() {
        super();

        const provider = new EntityContextProvider()
            .setAddHandler(entity => entity.emit("camera-attach", this.entity))
            .setRemoveHandler(entity => entity.emit("camera-detach", this.entity))

        this.eventHandler.on("attached-to-parent", (parent: Entity) => {
            provider.setEntity(this.entity.parent)
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            provider.setEntity(this.entity.parent)
        })
    }

    setViewport(viewport: { x: number, y: number }) {
        this.viewport = viewport
        return this
    }
}