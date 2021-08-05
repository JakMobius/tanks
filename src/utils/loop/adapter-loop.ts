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
        for(let steps = 1; steps < this.maximumSteps && this.accumulator > this.interval; steps++) {
            this.accumulator -= this.interval
            this.perform(this.timeCounter + this.interval)
        }

        if(this.accumulator > this.interval) {
            let stepsSkipped = Math.floor(this.accumulator / this.interval)
            this.accumulator -= this.interval * stepsSkipped;
            this.perform(this.timeCounter + this.interval * stepsSkipped)
        }
    }

    setInterval(interval: number) {
        this.interval = interval
    }
}