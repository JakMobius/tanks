import Entity from "../utils/ecs/entity";
import GameMap from "../map/game-map";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import {TransmitterSet} from "../entity/components/network/transmitting/transmitter-set";
import MapTransmitter from "../entity/components/network/map/map-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class TilemapComponent extends EventHandlerComponent {
    map?: GameMap
    private mapEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.mapEventHandler.on("block-update", (x, y) => this.entity.emit("map-block-update", x, y))
        this.mapEventHandler.on("block-damage", (event) => this.entity.emit("map-block-damage", event))
        this.mapEventHandler.on("block-change", (event) => this.entity.emit("map-block-change", event))

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(MapTransmitter)
        })
    }

    setMap(map?: GameMap) {
        this.map = map
        this.entity.emit("map-change")
        this.mapEventHandler.setTarget(map)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity)
    }

    onDetach() {
        super.onDetach()
        this.setMap(null)
    }

}