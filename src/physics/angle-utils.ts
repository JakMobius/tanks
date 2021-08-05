import {angleTangent, makeLimited, signedDoubleTriangleSurface} from "../utils/utils";
import {PhysicsPoint} from "./physics-chunk-manager";

/**
 * This function counts a value that grows monotonically with the angle between vectors ab and bc.
 * The resulting value is **not** the angle between these vectors, but can be used to compare those angles.
 *
 * *Benchmark* - 10 million runs of this function takes 900 ms. The function that uses Math.atan2 takes 1100ms.
 * Therefore, this function is 18% faster.
 */
export function getFastAngle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    /*
      angle = (0; 90)
      tangent > 0
      surface <= 0

      angle = [90; 180)
      tangent <= 0
      surface <= 0

      angle = [180; 270)
      tangent > 0
      surface > 0

      angle = (270; 360)
      tangent <= 0
      surface > 0
     */

    let tangent = angleTangent(x1, y1, x2, y2, x3, y3)
    let surface = signedDoubleTriangleSurface(x1, y1, x2, y2, x3, y3)
    let doubleQuadrant = (tangent > 0 ? 0 : 2) + (surface > 0 ? 4 : 0)

    return makeLimited(tangent) + doubleQuadrant
}

export function continuousPathTurnDirection(a: PhysicsPoint, b: PhysicsPoint, c: PhysicsPoint, d: PhysicsPoint, e: PhysicsPoint) {
    let directionA = pathTurnDirection(a, b, c)
    let directionB = pathTurnDirection(b, c, d)
    let directionC = pathTurnDirection(c, d, e)

    let direction = directionA
    if(directionB !== 0) {
        if(direction !== 0 && directionB !== direction) return null
        direction = directionB
    }
    if(directionC !== 0) {
        if(direction !== 0 && directionC !== direction) return null
        direction = directionC
    }
    return direction
}

export function pathTurnDirection(a: PhysicsPoint, b: PhysicsPoint, c: PhysicsPoint) {
    return pathTurnDirectionCoordinates(a[0], a[1], b[0], b[1], c[0], c[1])
}

export function pathTurnDirectionCoordinates(aX: number, aY: number, bX: number, bY: number, cX: number, cY: number) {
    return Math.sign(signedDoubleTriangleSurface(aX, aY, bX, bY, cX, cY))
}