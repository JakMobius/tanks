import Transmitter from "../transmitting/transmitter";
import {Commands} from "../commands";
import TilemapComponent from "src/physics/tilemap-component";
import BlockState from "src/map/block-state/block-state";
import BlockDamageEvent from "src/events/block-damage-event";
import BlockChangeEvent from "src/events/block-change-event";

export default class MapTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("map-block-damage", (event: BlockDamageEvent) => {
            if(event.cancelled) return
            this.queueBlockUpdate(event.x, event.y)
        })
        this.eventHandler.on("map-block-change", (event: BlockChangeEvent) => {
            this.queueBlockUpdate(event.x, event.y)
        })
    }

    onEnable() {
        super.onEnable()
        const map = this.getEntity().getComponent(TilemapComponent).map

        this.packIfEnabled(Commands.GAME_MAP_CONTENT_COMMAND, (buffer) => {
            map.toBinary(buffer)
        })
    }

    queueBlockUpdate(x: number, y: number) {
        const map = this.getEntity().getComponent(TilemapComponent).map

        this.packIfEnabled(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
            buffer.writeUint16(x)
            buffer.writeUint16(y)
            let block = map.getBlock(x, y)
            let blockType = (block.constructor as typeof BlockState)
            buffer.writeUint8(blockType.typeId)
            blockType.BinaryOptions.objectToBuffer(buffer, block)
        })
    }
}
