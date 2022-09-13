import Axle from "../../../controls/axle";

export interface TriggerAxleConfig {
    min?: number
    max?: number
}

export default class TriggerAxle extends Axle {
    public min: number;
    public max: number;
    public triggered: boolean = false;

    constructor(config: TriggerAxleConfig) {
        super()
        this.min = config.min === undefined ? 0 : config.min
        this.max = config.max === undefined ? 1 : config.max

        this.ownValue = this.min
    }

    trigger() {
        this.triggered = true
        this.setNeedsUpdate()
    }

    getValue() {
        if(this.triggered) {
            this.setNeedsUpdate()
            this.triggered = false
            return this.max
        }
        return this.min
    }
}