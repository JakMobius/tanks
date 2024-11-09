import Loop, {LoopConfig} from "./loop";

export interface AdapterLoopConfig extends LoopConfig {
    parentLoop?: Loop
    interval: number
    maximumSteps: number
}

export default class AdapterLoop extends Loop {
    private interval: number;
    private readonly maximumSteps: number
    private accumulator = 0;
    private timeCounter: number;

    constructor(config?: AdapterLoopConfig) {
        super(config);

        config = Object.assign({
            interval: 1 / 20,
            maximumSteps: 10
        }, config)
        
        this.interval = config.interval
        this.maximumSteps = config.maximumSteps
        this.timeCounter = 0

        if(config.parentLoop) {
            config.parentLoop.run = (dt) => this.timePassed(dt)
        }
    }

    timePassed(dt: number) {

        this.accumulator += dt;

        if(!this.running) return;

        // The step count is precalculated instead of subtracting the interval from the accumulator
        // because of floating point errors, which were causing the physics to not be deterministic
        // over time.

        let stepsRequired = Math.floor(this.accumulator / this.interval)

        for(let steps = 1; steps < this.maximumSteps && steps <= stepsRequired; steps++) {
            this.perform(this.timeCounter + this.interval * steps)
        }

        let oldAccumulator = this.accumulator

        this.accumulator -= stepsRequired * this.interval;

        if(this.accumulator > this.interval) {
            let stepsSkipped = Math.floor(this.accumulator / this.interval)
            this.accumulator -= this.interval * stepsSkipped;
            this.perform(this.timeCounter + this.interval * stepsSkipped)
        }

        this.timeCounter += (oldAccumulator - this.accumulator)
    }

    setInterval(interval: number) {
        this.interval = interval
    }
}