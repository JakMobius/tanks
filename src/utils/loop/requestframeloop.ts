
import Loop from './loop';

class RequestFrameLoop extends Loop {
	public request: any;

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

export default RequestFrameLoop;