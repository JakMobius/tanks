import Axle from '../../controls/axle';

export default class ButtonAxle extends Axle {
	public min: number;
	public max: number;
	public animationTime: number;
	public target: number;
	public keypressTimestamp: number;
	public pressed: boolean;

    constructor(min: number, max: number) {
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

    keyPressed(value?: number) {
        if (value === undefined) {
            this.target = this.max
        } else {
            this.target = this.max * value + this.min * (1 - value)
        }

        this.keypressTimestamp = Date.now()
        this.setNeedsUpdate()
    }

    keyReleased() {
        if(this.target == this.min) return;
        this.target = this.min
        this.keypressTimestamp = Date.now()
        this.setNeedsUpdate()
    }

    smooth(time: number = 0.25) {
        this.animationTime = time
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
        this.needsUpdate = false
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