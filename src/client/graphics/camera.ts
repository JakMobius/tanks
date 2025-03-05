import { Matrix3, inverse } from "src/utils/matrix3";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class CameraComponent extends EventHandlerComponent {
    matrix = new Matrix3()
    inverseMatrix = new Matrix3()
    parentEventHandler = new BasicEventHandlerSet()

    childAddHandler = (child: Entity) => this.onChildAdded(child)
    childRemoveHandler = (child: Entity) => this.onChildRemoved(child)

    constructor() {
        super();

        this.eventHandler.on("attached-to-parent", (parent: Entity) => {
            this.parentEventHandler.setTarget(parent)
            this.childAddHandler(parent)
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            this.parentEventHandler.setTarget(null)
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

    updateInverseMatrix() {
        this.inverseMatrix = this.matrix.inverted()
    }
}