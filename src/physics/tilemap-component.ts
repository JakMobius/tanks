import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import GameMap from "../map/game-map";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

export default class TilemapComponent implements Component {

    entity: Entity | null
    map?: GameMap
    private mapEventHandler = new BasicEventHandlerSet()

    constructor() {
        this.mapEventHandler.on("block-update", (x, y) => this.entity.emit("map-block-update", x, y))
        this.mapEventHandler.on("block-damage", (x, y) => this.entity.emit("map-block-damage", x, y))
        this.mapEventHandler.on("block-change", (x, y) => this.entity.emit("map-block-change", x, y))
    }

    setMap(map?: GameMap) {
        this.map = map
        this.entity.emit("map-change")
        this.mapEventHandler.setTarget(map)
    }

    onAttach(entity: Entity): void {
        this.entity = entity;
    }

    onDetach(): void {
        this.entity = null;
        this.mapEventHandler.setTarget(null)
    }

}