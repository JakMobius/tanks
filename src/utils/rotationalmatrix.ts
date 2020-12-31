
class RotationalMatrix {

    /**
     * Sine of the rotation angle
     * @type number
     */
    sin = 1;

    /**
     * Cosine of the rotation angle
     * @type number
     */
    cos = 0;

    constructor(angle?) {
        angle = angle || 0

        this.sin = Math.sin(angle)
        this.cos = Math.cos(angle)
    }

    angle(angle) {
        if(angle !== this.angle) {
            this.sin = Math.sin(angle)
            this.cos = Math.cos(angle)
        }
    }

    turnHorizontalAxis(x, y) {
        return x * this.cos - y * this.sin
    }

    turnVerticalAxis(x, y) {
        return x * this.sin + y * this.cos
    }
}

export default RotationalMatrix;