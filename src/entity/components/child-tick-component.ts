import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class ChildTickComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("tick", (dt) => {
            for (let child of this.entity.children) {
                child.emit("tick", dt)
            }
        })
    }
}