
import Matrix3 from "./matrix3";

export interface Quadrangle {
    x1: number
    y1: number
    x2: number
    y2: number
    x3: number
    y3: number
    x4: number
    y4: number
}

export function squareQuadrangle(x: number, y: number, width: number, height: number): Quadrangle {
    const x2 = x + width
    const y2 = y + height
    return {
        x1: x2, y1: y2,
        x2: x2, y2: y,
        x3: x,  y3: y2,
        x4: x,  y4: y,
    }
}

export function setQuadrangle(quadrangle: Quadrangle, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    quadrangle.x1 = x1
    quadrangle.y1 = y1
    quadrangle.x2 = x2
    quadrangle.y2 = y2
    quadrangle.x3 = x3
    quadrangle.y3 = y3
    quadrangle.x4 = x4
    quadrangle.y4 = y4
}

export function turnQuadrangle(quadrangle: Quadrangle, sin: number, cos: number) {
    const x1 = quadrangle.x1 * cos - quadrangle.y1 * sin
    const y1 = quadrangle.x1 * sin + quadrangle.y1 * cos
    const x2 = quadrangle.x2 * cos - quadrangle.y2 * sin
    const y2 = quadrangle.x2 * sin + quadrangle.y2 * cos
    const x3 = quadrangle.x3 * cos - quadrangle.y3 * sin
    const y3 = quadrangle.x3 * sin + quadrangle.y3 * cos
    const x4 = quadrangle.x4 * cos - quadrangle.y4 * sin
    const y4 = quadrangle.x4 * sin + quadrangle.y4 * cos

    setQuadrangle(quadrangle, x1, y1, x2, y2, x3, y3, x4, y4)
}

export function transformQuadrangle(quadrangle: Quadrangle, matrix: Matrix3) {
    const x1 = matrix.transformX(quadrangle.x1, quadrangle.y1)
    const y1 = matrix.transformY(quadrangle.x1, quadrangle.y1)
    const x2 = matrix.transformX(quadrangle.x2, quadrangle.y2)
    const y2 = matrix.transformY(quadrangle.x2, quadrangle.y2)
    const x3 = matrix.transformX(quadrangle.x3, quadrangle.y3)
    const y3 = matrix.transformY(quadrangle.x3, quadrangle.y3)
    const x4 = matrix.transformX(quadrangle.x4, quadrangle.y4)
    const y4 = matrix.transformY(quadrangle.x4, quadrangle.y4)

    setQuadrangle(quadrangle, x1, y1, x2, y2, x3, y3, x4, y4)
}

export function translateQuadrangle(quadrangle: Quadrangle, x: number, y: number) {
    quadrangle.x1 += x
    quadrangle.y1 += y
    quadrangle.x2 += x
    quadrangle.y2 += y
    quadrangle.x3 += x
    quadrangle.y3 += y
    quadrangle.x4 += x
    quadrangle.y4 += y
}

export function multipliedQuadrangle(quadrangle: Quadrangle, scale: number) {
    return {
        x1: quadrangle.x1 * scale,
        y1: quadrangle.y1 * scale,
        x2: quadrangle.x2 * scale,
        y2: quadrangle.y2 * scale,
        x3: quadrangle.x3 * scale,
        y3: quadrangle.y3 * scale,
        x4: quadrangle.x4 * scale,
        y4: quadrangle.y4 * scale,
    }
}

export function copyQuadrangle(quadrangle: Quadrangle) {
    return {
        x1: quadrangle.x1,
        y1: quadrangle.y1,
        x2: quadrangle.x2,
        y2: quadrangle.y2,
        x3: quadrangle.x3,
        y3: quadrangle.y3,
        x4: quadrangle.x4,
        y4: quadrangle.y4,
    }
}