import BlockState from "../map/block-state/block-state";
import PhysicsEdge, {solidBlockShape} from "./physics-edge";

export class PhysicsBlock {

    edges: PhysicsEdge[] = []
    static nullBlock: PhysicsBlock = new PhysicsBlock(null);

    constructor(block: BlockState | null) {
        this.updateBlock(block)
    }

    hasSide(side: number) {
        for (let edge of this.edges) {
            if (edge.isSide(side)) return true
        }
        return false
    }

    getEdge(sourceSide: number, targetSide: number) {
        for (let edge of this.edges) {
            if (edge.source === sourceSide && edge.target === targetSide) return edge
            if (edge.source === targetSide && edge.target === sourceSide) return edge
        }
        return null
    }

    updateBlock(block: BlockState) {
        if(!block) this.edges = []
        else {
            // TODO: This is wrong
            if((block.constructor as typeof BlockState).typeId === 0) this.edges = []
            else this.edges = solidBlockShape
        }
    }
}