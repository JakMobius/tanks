
const Axle = require("../../tanks/controls/axle")

class ButtonAxle extends Axle {
    constructor(min, max) {
        super()
        this.min = min === undefined ? 0 : min
        this.max = max === undefined ? 1 : max

        this.ownValue = this.min

        this.animationTime = 0
        this.target = 0

        // Internals
        this.keypressTimestamp = 0
        this.pressed = false
    }

    keyPressed(value) {
        if (value === undefined) {
            this.target = this.max
        } else {
            this.target = this.max * value + this.min * (1 - value)
        }

        this.keypressTimestamp = Date.now()
        this.setNeedsUpdate()
    }

    keyReleased() {
        this.target = this.min
        this.keypressTimestamp = Date.now()
        this.setNeedsUpdate()
    }

    smooth(time) {
        this.animationTime = time || 0.25
        return this
    }

    reverse() {
        this.max = -this.max
        this.min = -this.min
        return this
    }

    getValue() {
        if(this.animationTime <= 0) {
            this.ownValue = this.keyPressed ? this.max : this.min
        }
        this.update = false
        let now = Date.now()
        let dt = (now - this.keypressTimestamp) / 1000
        this.keypressTimestamp = now

        if(this.target > this.ownValue) {
            this.ownValue += dt / this.animationTime

            if(this.target < this.ownValue) this.ownValue = this.target
        } else if(this.target < this.ownValue) {
            this.ownValue -= dt / this.animationTime

            if(this.target > this.ownValue) this.ownValue = this.target
        }
        if(this.ownValue !== this.target) this.setNeedsUpdate()
        return this.ownValue
    }
}

module.exports = ButtonAxle