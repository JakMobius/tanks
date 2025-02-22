import Entity from "../utils/ecs/entity";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class WorldTilemapComponent extends EventHandlerComponent {
    map?: Entity
    private mapEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.mapEventHandler.on("update", (x, y) => this.entity.emit("map-update", x, y))
        this.mapEventHandler.on("block-update", (x, y) => this.entity.emit("map-block-update", x, y))
        this.mapEventHandler.on("block-damage", (event) => this.entity.emit("map-block-damage", event))
        this.mapEventHandler.on("block-change", (event) => this.entity.emit("map-block-change", event))
    }

    setMap(map?: Entity) {
        this.map = map
        this.entity.emit("map-change")
        this.mapEventHandler.setTarget(map)
        return this
    }

    onAttach(entity: Entity) {
        super.onAttach(entity)
    }

    onDetach() {
        super.onDetach()
        this.setMap(null)
    }

}