
class RotationalMatrix {

    /**
     * Rotation angle
     */
    angle: number

    /**
     * Sine of the rotation angle
     */
    sin: number;

    /**
     * Cosine of the rotation angle
     */
    cos: number;

    constructor(angle: number = 0) {

        this.sin = Math.sin(angle)
        this.cos = Math.cos(angle)
        this.angle = angle
    }

    setAngle(angle: number) {
        if(angle !== this.angle) {
            this.sin = Math.sin(angle)
            this.cos = Math.cos(angle)
            this.angle = angle
        }
    }

    turnHorizontalAxis(x: number, y: number) {
        return x * this.cos - y * this.sin
    }

    turnVerticalAxis(x: number, y: number) {
        return x * this.sin + y * this.cos
    }
}

export default RotationalMatrix;