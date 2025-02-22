import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import BlockState from "src/map/block-state/block-state";
import TilemapComponent from "src/map/tilemap-component";

export default class MapReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
            let x = buffer.readUint16()
            let y = buffer.readUint16()
            let id = buffer.readUint8()
            let damage = buffer.readFloat32()

            let Block = BlockState.getBlockStateClass(id)
            let block = new Block({
                damage: damage
            })

            this.entity.getComponent(TilemapComponent).setBlock(x, y, block)
        })

        receiveComponent.commandHandlers.set(Commands.GAME_MAP_CONTENT_COMMAND, (buffer) => {
            let width = buffer.readInt32()
            let height = buffer.readInt32()
            let blocks = []

            let blockCount = width * height
            for(let i = 0; i < blockCount; i++) {
                let id = buffer.readInt16()
                let damage = buffer.readFloat32()
                let Block = BlockState.getBlockStateClass(id)
                let block = new Block({
                    damage: damage
                })
                blocks.push(block)
            }

            this.entity.getComponent(TilemapComponent).setMap(width, height, blocks)
        })
    }
}