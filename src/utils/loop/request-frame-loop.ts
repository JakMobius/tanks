import Loop, {LoopConfig} from './loop';

export default class RequestFrameLoop extends Loop {
	public request: boolean = false;

    constructor(config: LoopConfig) {
        super(config);
        this.request = false
    }

    start() {
        if(this.request) return

        this.request = true
        requestAnimationFrame((time) => {
            this.request = false

            super.start()
            this.perform(time)
            this.stop()
        });
    }
}