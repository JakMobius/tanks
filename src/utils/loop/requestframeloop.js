
const Loop = require("./loop")

class RequestFrameLoop extends Loop {

    constructor(game) {
        super(game);
        this.timeMultiplier = 0.001
        this.request = false
    }

    start() {
        if(this.request) {
            return
        }
        this.request = true
        requestAnimationFrame((time) => {
            this.request = false

            super.start()
            this.perform(time)
            this.stop()
        });
    }
}

module.exports = RequestFrameLoop