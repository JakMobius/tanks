import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import BlockState from "src/map/block-state/block-state";
import TilemapComponent from "src/physics/tilemap-component";
import GameMap from "src/map/game-map";

export default class MapReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.BLOCK_UPDATE_COMMAND, (buffer) => {
            let x = buffer.readUint16()
            let y = buffer.readUint16()
            let id = buffer.readUint8()

            let Block = BlockState.getBlockStateClass(id)
            let block = new Block(Block.BinaryOptions.bufferToObject(buffer))

            const map = this.entity.getComponent(TilemapComponent).map
            map.setBlock(x, y, block)
        })

        receiveComponent.commandHandlers.set(Commands.GAME_MAP_CONTENT_COMMAND, (buffer) => {
            let map = GameMap.fromBinary(buffer)
            map.update()
            this.entity.getComponent(TilemapComponent).setMap(map)
        })
    }
}