import PhysicsChunk from "./physics-chunk";
import {PhysicsPoint} from "./physics-chunk-manager";
import {areCollinear, areEqualToTheFlip, getLineIntersection} from "../utils/utils";
import PhysicsEdge from "./physics-edge";
import {continuousPathTurnDirection, pathTurnDirection} from "./angle-utils";

export enum VectorLocation {
    Inside,
    Outside,
    Mixed
}

export class MeshGenerationContext {
    private readonly chunk: PhysicsChunk;
    private currentPath: PhysicsPoint[] = [];
    private anchorIndex: number = 0;
    private twistDirection: number = 0;
    private shapeHasVolume: boolean = false
    private anchorPoint: PhysicsPoint;

    constructor(chunk: PhysicsChunk) {
        this.chunk = chunk
    }

    private vectorLocationInBlock(sourceX: number, sourceY: number, targetX: number, targetY: number, blockX: number, blockY: number, vectorFacing: number): VectorLocation {
        let block = this.chunk.getBlock(blockX, blockY)

        let metSource = false
        let metTarget = false
        let crossedWildSide = false

        for(let edge of block.edges) {

            let edgeSourceX = edge.getSourceX() + blockX
            let edgeSourceY = edge.getSourceY() + blockY
            let edgeTargetX = edge.getTargetX() + blockX
            let edgeTargetY = edge.getTargetY() + blockY

            // If we're passing through an opened edge, we should make sure that it's
            // facing allows us to build the shape.

            if(vectorFacing !== 0 && areEqualToTheFlip(edgeSourceX, edgeSourceY, edgeTargetX, edgeTargetY, sourceX, sourceY, targetX, targetY)) {
                // Make sure edge is opened, otherwise it won't have any facing
                if(edge.opened(this.chunk, blockX, blockY)) {

                    let facing = this.chunk.getFacing(sourceX, sourceY, targetX, targetY, blockX, blockY)
                    if (facing !== vectorFacing) {
                        return VectorLocation.Outside
                    }
                }
            }

            // Make sure our vector is crossing (or touching) two block sides.
            // This will mean that the vector does not cross other facets of it
            if(edge.isAnySide()) {
                if (areCollinear(edgeSourceX, edgeSourceY, edgeTargetX, edgeTargetY, sourceX, sourceY)) metSource = true
                if (areCollinear(edgeSourceX, edgeSourceY, edgeTargetX, edgeTargetY, targetX, targetY)) metTarget = true
            } else {
                let intersection = getLineIntersection(edgeSourceX, edgeSourceY, edgeTargetX, edgeTargetY, sourceX, sourceY, targetX, targetY)
                if(intersection.k && intersection.onLine1 && intersection.onLine2) crossedWildSide = true
            }
        }

        if(!metSource && !metTarget) return VectorLocation.Outside
        if(!metSource || !metTarget) {
            if(crossedWildSide) return VectorLocation.Mixed
            return VectorLocation.Outside
        }
        return VectorLocation.Inside
    }

    traceFacedRay(sourceX: number, sourceY: number, targetX: number, targetY: number, rayFacing: number) {

        let rayX = sourceX
        let rayY = sourceY

        let distanceX = targetX - sourceX
        let distanceY = targetY - sourceY

        if (distanceX === 0 && distanceY === 0) return true

        while (true) {

            // Counting distances to the next block
            let nextDistanceX = distanceX > 0 ? Math.ceil(rayX) - rayX : Math.floor(rayX) - rayX
            let nextDistanceY = distanceY > 0 ? Math.ceil(rayY) - rayY : Math.floor(rayY) - rayY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(distanceX)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(distanceY)

            let nextDistanceFraction = 1

            if (distanceX !== 0) nextDistanceFraction = nextDistanceX / distanceX
            if (distanceY !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / distanceY)

            let deltaX = distanceX * nextDistanceFraction
            let deltaY = distanceY * nextDistanceFraction

            let checkX = rayX + deltaX * 0.5
            let checkY = rayY + deltaY * 0.5

            let newX = rayX + deltaX
            let newY = rayY + deltaY

            if ((checkX < targetX) !== (sourceX < targetX)) break;
            if ((checkY < targetY) !== (sourceY < targetY)) break;

            let shouldCheckX = deltaX === 0 && checkX === Math.floor(checkX)
            let shouldCheckY = deltaY === 0 && checkY === Math.floor(checkY)

            checkX = Math.floor(checkX)
            checkY = Math.floor(checkY)

            if(shouldCheckX || shouldCheckY) {
                let locationA, locationB

                if(shouldCheckX) {
                    locationA = this.vectorLocationInBlock(rayX, rayY, newX, newY, checkX, checkY, rayFacing)
                    locationB = this.vectorLocationInBlock(rayX, rayY, newX, newY, checkX - 1, checkY, rayFacing)
                } else {
                    locationA = this.vectorLocationInBlock(rayX, rayY, newX, newY, checkX, checkY, rayFacing)
                    locationB = this.vectorLocationInBlock(rayX, rayY, newX, newY, checkX, checkY - 1, rayFacing)
                }

                if(locationA == VectorLocation.Mixed || locationB == VectorLocation.Mixed) return false
                if(locationA != VectorLocation.Inside && locationB != VectorLocation.Inside) return false
            } else {
                if (this.vectorLocationInBlock(rayX, rayY, newX, newY, checkX, checkY, rayFacing) !== VectorLocation.Inside) {
                    return false
                }
            }

            rayX = newX
            rayY = newY
        }

        return true;
    }

    private getHelperPoint(): PhysicsPoint {
        let lastPoint = this.currentPath[this.currentPath.length - 1]

        let dx = Math.sign(lastPoint[0] - this.anchorPoint[0])
        let dy = Math.sign(lastPoint[1] - this.anchorPoint[1])

        let direction = PhysicsEdge.directionIndex(dx, dy)
        let opposite = PhysicsEdge.oppositeDirectionIndex(direction)

        for(let directionShift = -2; directionShift <= 2; directionShift++) {
            if(directionShift === 0) continue

            let direction = PhysicsEdge.directions[(opposite + directionShift) & 7]
            let possiblePoint: PhysicsPoint = [lastPoint[0] + direction[0], lastPoint[1] + direction[1]]
            if(this.isValidHelperPoint(possiblePoint)) return possiblePoint
        }

        // This would never happen
        return null
    }

    private isValidHelperPoint(point: PhysicsPoint) {
        let lastPoint = this.currentPath[this.currentPath.length - 1]

        let facing = pathTurnDirection(this.anchorPoint, lastPoint, point)

        if(!this.traceFacedRay(point[0], point[1], this.anchorPoint[0], this.anchorPoint[1], -facing)) return false
        return this.traceFacedRay(point[0], point[1], lastPoint[0], lastPoint[1], -facing);


    }

    private startNewShape(point: PhysicsPoint) {
        this.anchorPoint = point
        this.currentPath = [point]
        this.anchorIndex = 0
        this.twistDirection = 0
        this.shapeHasVolume = false
    }

    private canWalkToPoint(point: PhysicsPoint): boolean {
        // Make sure that the shape remains convex after adding a new point

        let currentTwistDirection = continuousPathTurnDirection(
            this.currentPath[this.currentPath.length - 2],
            this.currentPath[this.currentPath.length - 1],
            point,
            this.currentPath[0],
            this.currentPath[1]
        )

        if(currentTwistDirection === null) return false

        if(currentTwistDirection !== 0) {
            if(this.twistDirection !== 0 && currentTwistDirection !== this.twistDirection) {
                return false
            }
            this.twistDirection = currentTwistDirection
        }

        // Make sure that the shape doesn't go into an empty space

        if(this.twistDirection === 0) return true

        return this.traceFacedRay(point[0], point[1], this.anchorPoint[0], this.anchorPoint[1], -this.twistDirection);
    }

    private getPathMesh(path: PhysicsPoint[], array: PhysicsPoint[][] = []): PhysicsPoint[][] {
        this.startNewShape(path[0])
        this.currentPath.push(path[1])

        for (let i = 2; i <= path.length; i++) {
            let point;

            if (i === path.length) {
                // If path is already closed and its final shape
                // have a volume, don't create an excessive point
                if(this.shapeHasVolume) break;

                // Otherwise it's necessary to step a bit further.
                point = path[1]
            } else point = path[i]

            // If shape is invalid, closing it and starting a new shape

            if (!this.canWalkToPoint(point)) {
                if (!this.shapeHasVolume) {
                    let helperPoint = this.getHelperPoint()
                    this.addPathPoint(helperPoint)
                }

                array.push(this.currentPath)
                this.startNewShape(path[i - 1])
            }

            if(this.twistDirection !== 0) this.shapeHasVolume = true

            this.addPathPoint(point)
        }

        array.push(this.currentPath)
        return array
    }

    generateDebugMesh(paths: PhysicsPoint[][]): PhysicsPoint[][][] {
        return paths.map(path => this.getPathMesh(path))
    }

    generateMesh(paths: PhysicsPoint[][]): PhysicsPoint[][] {
        let result: PhysicsPoint[][] = []

        for (let path of paths) this.getPathMesh(path, result)

        return result
    }

    private addPathPoint(point: PhysicsPoint) {
        let currentLength = this.currentPath.length
        if(this.currentPath.length >= 2) {
            let a = this.currentPath[currentLength - 2]
            let b = this.currentPath[currentLength - 1]
            if(areCollinear(a[0], a[1], b[0], b[1], point[0], point[1])) {
                this.currentPath[currentLength - 1] = point
                return
            }
        }

        this.currentPath.push(point)
    }
}