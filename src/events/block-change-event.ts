import BlockState from "../map/block-state/block-state";

export default class BlockChangeEvent {
    newBlock?: BlockState
    oldBlock?: BlockState
    x?: number
    y?: number

    constructor(block?: BlockState, oldBlock?: BlockState, x?: number, y?: number) {
        this.newBlock = block
        this.oldBlock = block
        this.x = x
        this.y = y
    }
}