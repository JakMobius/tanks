import CancellableEvent from "./cancellable-event";
import BlockState from "../map/block-state/block-state";

export default class BlockDamageEvent extends CancellableEvent {
    block: BlockState
    x: number
    y: number
    damage: number

    constructor(block: BlockState, x: number, y: number, damage: number) {
        super();
        this.block = block
        this.x = x
        this.y = y
        this.damage = damage
    }
}