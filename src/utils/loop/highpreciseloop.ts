
import Loop from './loop';

class HighPreciseLoop extends Loop {
	public interval: any;
	public totalTime: any;

    constructor() {
        super();
        this.interval = 1000 / 60
        this.maximumTimestep = 100
        this.totalTime = 0
    }
    start() {
        super.start();
        this.perform()
    }

    cycle(dt: number) {
        this.totalTime -= dt
        this.totalTime += this.interval
        if(this.totalTime < -this.maximumTimestep) {
            this.totalTime = -this.maximumTimestep
        }
        setTimeout(() => this.perform(), this.totalTime + this.interval)
    }
}

export default HighPreciseLoop;