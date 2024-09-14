import BlockState from "../map/block-state/block-state";

export default class BlockChangeEvent {
    newBlock?: BlockState
    oldBlock?: BlockState
    x?: number
    y?: number

    constructor(oldBlock?: BlockState, newBlock?: BlockState, x?: number, y?: number) {
        this.newBlock = newBlock
        this.oldBlock = oldBlock
        this.x = x
        this.y = y
    }
}