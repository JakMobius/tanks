import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class CameraComponent extends EventHandlerComponent {
    childAddHandler = (child: Entity) => this.onChildAdded(child)
    childRemoveHandler = (child: Entity) => this.onChildRemoved(child)

    constructor() {
        super();

        this.eventHandler.on("attached-to-parent", (parent: Entity) => {
            this.childAddHandler(parent)
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            this.childRemoveHandler(parent)
        })
    }

    onChildAdded(child: Entity) {
        child.emit("camera-attach", this.entity)
        child.on("child-added", this.childAddHandler)
        child.on("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.onChildAdded(nestedChild)
        }
    }

    onChildRemoved(child: Entity) {
        child.emit("camera-detach", this.entity)
        child.off("child-added", this.childAddHandler)
        child.off("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.onChildRemoved(nestedChild)
        }
    }
}