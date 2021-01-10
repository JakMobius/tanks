
import Loop from './loop';

class RenderLoop extends Loop {

    constructor() {
        super();
        this.timeMultiplier = 0.001
    }

    start() {
        super.start();
        this.perform(0)
    }

    cycle(dt: number) {
        requestAnimationFrame((time) => {
            this.perform(time)
        });
    }
}

export default RenderLoop;