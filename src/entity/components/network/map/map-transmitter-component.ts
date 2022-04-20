import {TransmitterComponent} from "../transmitter-component";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";
import TilemapComponent from "../../../../physics/tilemap-component";
import BlockState from "../../../../map/block-state/block-state";

export default class MapTransmitterComponent extends TransmitterComponent {
    constructor() {
        super()

        this.eventHandler.on("map-block-damage", (x, y) => this.queueBlockUpdate(x, y))
        this.eventHandler.on("map-block-change", (x, y) => this.queueBlockUpdate(x, y))
    }

    queueBlockUpdate(x: number, y: number) {
        const map = this.entity.getComponent(TilemapComponent).map

        this.onPack((context) => {
            context.pack(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
                buffer.writeUint16(x)
                buffer.writeUint16(y)
                let block = map.getBlock(x, y)
                let blockType = (block.constructor as typeof BlockState)
                buffer.writeUint8(blockType.typeId)
                blockType.BinaryOptions.objectToBuffer(buffer, block)
            })
        })
    }
}
