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

    setEdges(edges: PhysicsEdge[]) {
        if(edges.length !== this.edges.length) {
            this.edges = edges
            return true
        }
        for(let i = 0; i < edges.length; i++) {
            let e1 = this.edges[i]
            let e2 = this.edges[i]

            if(!e1.equals(e2)) {
                this.edges = edges
                return true
            }
        }
        return false
    }

    updateBlock(block: BlockState) {
        if(block?.solid) {
            return this.setEdges(solidBlockShape)
        }
        return this.setEdges([])
    }
}