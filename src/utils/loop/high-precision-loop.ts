import Loop, {LoopConfig} from './loop';

export interface HighPrecisionLoopConfig extends LoopConfig {
    /**
     * Target loop timestep in milliseconds
     */
    interval: number
}

export default class HighPrecisionLoop extends Loop {
	public interval: number;
	public totalTime: number;

    constructor(config?: HighPrecisionLoopConfig) {
        super(config);
        config = Object.assign({
            interval: 1000 / 60
        }, config)

        this.interval = config.interval
        this.maximumTimestep = config.maximumTimestep
        this.totalTime = 0
    }

    start() {
        super.start();
        this.perform()
    }

    cycle(dt: number) {
        dt /= this.timeMultiplier
        this.totalTime -= dt
        this.totalTime += this.interval
        if(this.totalTime < -this.maximumTimestep) {
            this.totalTime = -this.maximumTimestep
        }
        setTimeout(() => this.perform(), this.totalTime + this.interval)
    }
}