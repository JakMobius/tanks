
const Loop = require("./loop")

class HighPreciseLoop extends Loop {

    constructor(game) {
        super(game);
        this.interval = 1000 / 60
        this.maximumTimestep = 100
        this.totalTime = 0
    }
    start() {
        super.start();
        this.perform()
    }

    cycle(dt) {
        this.totalTime -= dt
        this.totalTime += this.interval
        if(this.totalTime < -this.maximumTimestep) {
            this.totalTime = -this.maximumTimestep
        }
        setTimeout(() => this.perform(), this.totalTime + this.interval)
    }
}

module.exports = HighPreciseLoop