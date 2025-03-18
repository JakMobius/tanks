import Entity from "src/utils/ecs/entity";
import BlockState from "../map/block-state/block-state";

export default class BlockChangeEvent {
    map: Entity
    newBlock?: BlockState
    oldBlock?: BlockState
    x?: number
    y?: number

    constructor(map: Entity, oldBlock?: BlockState, newBlock?: BlockState, x?: number, y?: number) {
        this.map = map
        this.newBlock = newBlock
        this.oldBlock = oldBlock
        this.x = x
        this.y = y
    }

    clone() {
        return new BlockChangeEvent(this.map, this.oldBlock, this.newBlock, this.x, this.y)
    }
}