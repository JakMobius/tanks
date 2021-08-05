import PhysicsChunk from "./physics-chunk";
import PhysicsEdge from "./physics-edge";
import {PhysicsPoint} from "./physics-chunk-manager";
import {getFastAngle} from "./angle-utils";

export default class EdgeFindingContext {
    private readonly chunk: PhysicsChunk;

    constructor(chunk: PhysicsChunk) {
        this.chunk = chunk
    }

    edgeUsed(buffer: number[], x: number, y: number, oldX: number, oldY: number, set: boolean) {
        let directionIndex = PhysicsEdge.directionIndex(x - oldX, y - oldY)
        if(directionIndex >= 4) {
            directionIndex = PhysicsEdge.oppositeDirectionIndex(directionIndex)
            x = oldX
            y = oldY
        }
        let mask = 1 << directionIndex

        let index = x + y * (this.chunk.width + 1)
        if ((buffer[index] & mask) === 0) {
            if (set) buffer[index] |= mask
            return false
        }
        return true
    }

    getOppositeEdgeCorner(edge: PhysicsEdge, corner: number): number {
        if(edge.target === corner) return edge.source
        else if(edge.source === corner) return edge.target
        return null
    }

    traversePath(x: number, y: number, buffer: number[]): PhysicsPoint[]
    traversePath(x: number, y: number, buffer: number[], blockX?: number, blockY?: number, oldX?: number, oldY?: number, path?: PhysicsPoint[]): PhysicsPoint[]
    traversePath(x: number, y: number, buffer: number[], blockX?: number, blockY?: number, oldX?: number, oldY?: number, path?: PhysicsPoint[]): PhysicsPoint[] {
        let isFirstPoint = oldX === undefined

        if (!isFirstPoint && this.edgeUsed(buffer, x, y, oldX, oldY, true)) return null

        if(!path) path = [[x, y]]
        else if(x == path[0][0] && y == path[0][1]) {
            // If our path is now closed, it's finished
            return path
        }

        let foundVariant = false
        let bestX: number = 0
        let bestY: number = 0
        let bestBlockX: number = 0
        let bestBlockY: number = 0

        // If preferredDirection == 1, than selecting the most "clockwise" way (maximising angle)
        let preferredDirection: number = 0
        if(!isFirstPoint) {
            preferredDirection = this.chunk.getFacing(oldX, oldY, x, y, blockX, blockY)
        }

        let bestAngle: number = 0

        for (let dy = -1; dy <= 0; dy++) {
            for (let dx = -1; dx <= 0; dx++) {

                let siblingX = x + dx
                let siblingY = y + dy

                let block = this.chunk.getBlock(siblingX, siblingY)

                for (let edge of block.edges) {
                    let side = PhysicsEdge.cornerIndexFromLocalOffsets(-dx, -dy)
                    let nextPosition = this.getOppositeEdgeCorner(edge, side)

                    if(nextPosition === null) continue;
                    if (!edge.opened(this.chunk, siblingX, siblingY)) continue;

                    let newX = PhysicsEdge.cornerXCoordinates[nextPosition] + siblingX
                    let newY = PhysicsEdge.cornerYCoordinates[nextPosition] + siblingY

                    if (this.edgeUsed(buffer, newX, newY, x, y, false)) continue

                    if(preferredDirection !== 0) {
                        let angle = getFastAngle(oldX, oldY, x, y, newX, newY)

                        if (foundVariant && preferredDirection === 1 && angle > bestAngle) continue;
                        if (foundVariant && preferredDirection === -1 && angle < bestAngle) continue;

                        bestAngle = angle
                    }

                    foundVariant = true
                    bestX = newX
                    bestY = newY
                    bestBlockX = siblingX
                    bestBlockY = siblingY
                }
            }
        }

        if (!foundVariant) {
            path.push([path[0][0], path[0][1]])
            if (path.length < 3) return null
            return path
        }

        path.push([bestX, bestY])

        this.traversePath(bestX, bestY, buffer, bestBlockX, bestBlockY, x, y, path)

        return path
    }

    findPaths(): PhysicsPoint[][] {
        let buffer = new Array((this.chunk.width + 1) * (this.chunk.height + 1)).fill(0)

        let result = []

        for (let y = 0; y <= this.chunk.width; y++) {
            for (let x = 0; x <= this.chunk.height; x++) {
                let path = this.traversePath(x, y, buffer)
                if (path) result.push(path)
            }
        }
        return result
    }
}