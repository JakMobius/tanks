
import BlockState from "src/map/block-state/block-state";
import BlockDamageEvent from "src/events/block-damage-event";
import BlockChangeEvent from "src/events/block-change-event";
import TilemapComponent from "src/map/tilemap-component";
import Transmitter from "../network/transmitting/transmitter";
import { Commands } from "../network/commands";

export default class MapTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("block-damage", (event: BlockDamageEvent) => {
            if(event.cancelled) return
            this.sendBlockUpdate(event.x, event.y)
        })
        this.eventHandler.on("block-change", (event: BlockChangeEvent) => {
            this.sendBlockUpdate(event.x, event.y)
        })
        this.eventHandler.on("update", (event: BlockChangeEvent) => {
            this.sendMap()
        })
    }

    onEnable() {
        super.onEnable()
        this.sendMap()
    }

    sendMap() {
        const map = this.getEntity().getComponent(TilemapComponent)

        this.packIfEnabled(Commands.GAME_MAP_CONTENT_COMMAND, (buffer) => {
            buffer.writeInt32(map.width)
            buffer.writeInt32(map.height)
            
            let blocks = map.width * map.height
            for(let i = 0; i < blocks; i++) {
                let block = map.blocks[i]
                buffer.writeInt16((block.constructor as typeof BlockState).typeId)
                buffer.writeFloat32(block.damage)
            }
        })
    }

    sendBlockUpdate(x: number, y: number) {
        const map = this.getEntity().getComponent(TilemapComponent)

        this.packIfEnabled(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
            buffer.writeUint16(x)
            buffer.writeUint16(y)
            let block = map.getBlock(x, y)
            let blockType = (block.constructor as typeof BlockState)
            buffer.writeUint16(blockType.typeId)
            buffer.writeFloat32(block.damage)
        })
    }
}
