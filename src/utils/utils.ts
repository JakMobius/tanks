
export const epsilon = 1e-10

export function trimFileExtension(name: string) {
    let parts = name.split(".")
    if(parts.length > 1) parts.pop()
    return parts.join(".")
}

export function dist2(vx: number, vy: number, wx: number, wy: number) {
    return (vx - wx) ** 2 + (vy - wy) ** 2
}

export function distToSegmentSquared(px: number, py: number, vx: number, vy: number, wx: number, wy: number) {
    const l2 = dist2(vx, vy, wx, wy);
    if (l2 === 0) return dist2(px, py, vx, vy);
    let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(px, py, vx + t * (wx - vx), vy + t * (wy - vy));
}

export function distToSegment(px: number, py: number, vx: number, vy: number, wx: number, wy: number) {
    return Math.sqrt(distToSegmentSquared(px, py, vx, vy, wx, wy));
}

export function random(min: number, max: number) {
    return Math.random() * (max - min) + min
}

export function clamp(value: number, min: number, max: number) {
    if(value < min) return min
    if(value > max) return max
    return value
}

/**
 * Projects a number in [-inf, +inf] range to [-1, 1] range
 */
export function makeLimited(n: number) {
    if(n >= 0) return (1 - 1 / (1 + n))
    return (-1 - 1 / (n - 1))
}

/**
 * Return tangent of angle between three points
 */
export function angleTangent(aX: number, aY: number, bX: number, bY: number, cX: number, cY: number) {
    let vX = bX - aX
    let vY = bY - aY
    let wX = cX - bX
    let wY = cY - bY

    let numerator = wY * vX - wX * vY
    let denominator = wX * vX + wY * vY

    if(denominator === 0) return Infinity
    return numerator / denominator
}

/**
 * Returns a signed doubled surface of triangle, built on points a, b, c
 */
export function signedDoubleTriangleSurface(aX: number, aY: number, bX: number, bY: number, cX: number, cY: number) {
    return (aX * (bY - cY) + bX * (cY - aY) + cX * (aY - bY))
}

/**
 * Returns intersection point of two segments
 */
export function getLineIntersection(line1StartX: number, line1StartY: number, line1EndX: number, line1EndY: number, line2StartX: number, line2StartY: number, line2EndX: number, line2EndY: number) {

    const result: { k?: number, onLine1: boolean, onLine2: boolean } = {
        k: null,
        onLine1: false,
        onLine2: false
    };

    let denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));

    if (denominator === 0) return result;

    let a = line1StartY - line2StartY;
    let b = line1StartX - line2StartX;

    let numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    let numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);

    a = numerator1 / denominator;
    b = numerator2 / denominator;

    result.k = a

    if (a > 0 && a < 1) result.onLine1 = true;
    if (b > 0 && b < 1) result.onLine2 = true;

    return result;
}

/**
 * Checks whether points a, b and c lie on the same line
 */
export function areCollinear(aX: number, aY: number, bX: number, bY: number, cX: number, cY: number) {
    return Math.abs(signedDoubleTriangleSurface(aX, aY, bX, bY, cX, cY)) < epsilon
}

/**
 * Checks if two given vectors are equal to the accuracy of the reversal
 */
export function areEqualToTheFlip(aX: number, aY: number, bX: number, bY: number, cX: number, cY: number, dX: number, dY: number) {
    return (aX == cX && aY == cY && bX == dX && bY == dY) || (aX == dX && aY == dY && bX == cX && bY == cY)
}