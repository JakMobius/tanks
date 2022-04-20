import {Transmitter} from "../transmitting/transmitter";
import {Commands} from "../commands";
import TilemapComponent from "../../../../physics/tilemap-component";
import BlockState from "../../../../map/block-state/block-state";
import {TransmitterSet} from "../transmitting/transmitter-set";

export default class MapTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("map-block-damage", (x, y) => this.queueBlockUpdate(x, y))
        this.eventHandler.on("map-block-change", (x, y) => this.queueBlockUpdate(x, y))
    }

    attachToSet(set: TransmitterSet) {
        super.attachToSet(set);

        const map = this.getEntity().getComponent(TilemapComponent).map

        this.pack(Commands.GAME_MAP_CONTENT_COMMAND, (buffer) => {
            map.toBinary(buffer)
        })
    }

    queueBlockUpdate(x: number, y: number) {
        const map = this.getEntity().getComponent(TilemapComponent).map

        this.pack(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
            buffer.writeUint16(x)
            buffer.writeUint16(y)
            let block = map.getBlock(x, y)
            let blockType = (block.constructor as typeof BlockState)
            buffer.writeUint8(blockType.typeId)
            blockType.BinaryOptions.objectToBuffer(buffer, block)
        })
    }
}
