import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import GameMap from "../map/game-map";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import {TransmitterSet} from "../entity/components/network/transmitting/transmitter-set";
import MapTransmitter from "../entity/components/network/map/map-transmitter";

export default class TilemapComponent implements Component {

    entity: Entity | null
    map?: GameMap
    private mapEventHandler = new BasicEventHandlerSet()
    private eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.mapEventHandler.on("block-update", (x, y) => this.entity.emit("map-block-update", x, y))
        this.mapEventHandler.on("block-damage", (event) => this.entity.emit("map-block-damage", event))
        this.mapEventHandler.on("block-change", (event) => this.entity.emit("map-block-change", event))

        this.eventHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(MapTransmitter)
        })
    }

    setMap(map?: GameMap) {
        this.map = map
        this.entity.emit("map-change")
        this.mapEventHandler.setTarget(map)
    }

    onAttach(entity: Entity) {
        this.entity = entity;
        this.eventHandler.setTarget(this.entity)
    }

    onDetach() {
        this.entity = null;
        this.mapEventHandler.setTarget(null)
        this.eventHandler.setTarget(this.entity)
    }

}