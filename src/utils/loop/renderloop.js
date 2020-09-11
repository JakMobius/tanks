
const Loop = require("./loop")

class RenderLoop extends Loop {

    constructor(game) {
        super(game);
        this.timeMultiplier = 0.001
    }

    start() {
        super.start();
        this.perform(0)
    }

    cycle(dt) {
        requestAnimationFrame((time) => {
            this.perform(time)
        });
    }
}

module.exports = RenderLoop