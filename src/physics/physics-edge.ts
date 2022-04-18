import PhysicsChunk from "./physics-chunk";

export default class PhysicsEdge {

    static cornerXCoordinates = [0, 1, 1, 0]
    static cornerYCoordinates = [0, 0, 1, 1]
    static directions = [
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
    ]

    source: number
    target: number

    constructor(sourceCorner: number, targetCorner: number) {
        this.source = sourceCorner
        this.target = targetCorner
    }

    opened(map: PhysicsChunk, x: number, y: number) {
        let a = Math.min(this.source, this.target)
        let b = Math.max(this.source, this.target)

        if (b === 3 && a === 0) {
            a = 3
            b = 0
        }
        if (((a + 1) & 3) === b) {
            switch (a) {
                case 0: return !map.getBlock(x, y - 1).hasSide(2)
                case 1: return !map.getBlock(x + 1, y).hasSide(3)
                case 2: return !map.getBlock(x, y + 1).hasSide(0)
                case 3: return !map.getBlock(x - 1, y).hasSide(1)
            }
        }
        return true;
    }

    isAnySide() {
        let a = Math.min(this.source, this.target)
        let b = Math.max(this.source, this.target)
        if (b === 3 && a === 0) {
            a = 3
            b = 0
        }
        return ((a + 1) & 3) === b
    }

    isSide(side: number) {
        let a = Math.min(this.source, this.target)
        let b = Math.max(this.source, this.target)
        if (b === 3 && a === 0) {
            a = 3
            b = 0
        }
        if (((a + 1) & 3) === b) {
            return a === side
        }
        return false
    }

    static cornerIndexFromLocalOffsets(x: number, y: number) {
        if(x == 0) {
            if(y == 0) return 0
            if(y == 1) return 3
        }
        if(x == 1) {
            if(y == 0) return 1
            if(y == 1) return 2
        }
        return null
    }

    getSourceX() {
        return PhysicsEdge.cornerXCoordinates[this.source]
    }

    getSourceY() {
        return PhysicsEdge.cornerYCoordinates[this.source]
    }

    getTargetX() {
        return PhysicsEdge.cornerXCoordinates[this.target]
    }

    getTargetY() {
        return PhysicsEdge.cornerYCoordinates[this.target]
    }

    static directionIndex(x: number, y: number) {
        if(y !== -1 && y !== 0 && y !== 1) return null
        if(x === -1) return y + 4
        if(x === 0 && y !== 0) return y * 2 + 4
        if(x == 1) return (8 - y) & 7
        return null
    }

    static oppositeDirectionIndex(directionIndex: number) {
        return (directionIndex + 4) & 7
    }
}

export const solidBlockShape = [
    new PhysicsEdge(0, 1),
    new PhysicsEdge(1, 2),
    new PhysicsEdge(2, 3),
    new PhysicsEdge(3, 0)
]

export const triangleEdgesLT = [
    new PhysicsEdge(3, 1),
    new PhysicsEdge(1, 2),
    new PhysicsEdge(2, 3)
]

export const triangleEdgesRT = [
    new PhysicsEdge(0, 2),
    new PhysicsEdge(2, 3),
    new PhysicsEdge(3, 0)
]

export const triangleEdgesLB = [
    new PhysicsEdge(0, 1),
    new PhysicsEdge(1, 2),
    new PhysicsEdge(2, 0)
]

export const triangleEdgesRB = [
    new PhysicsEdge(0, 1),
    new PhysicsEdge(1, 3),
    new PhysicsEdge(3, 0)
]