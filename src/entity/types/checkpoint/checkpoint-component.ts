import { PropertyInspector } from "src/entity/components/inspector/property-inspector";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class CheckpointComponent extends EventHandlerComponent {
    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            
        })
    }
}