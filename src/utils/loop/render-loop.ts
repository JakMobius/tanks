import Loop, {LoopConfig} from './loop';

export default class RenderLoop extends Loop {

    frame: number | null = null

    constructor(config: LoopConfig) {
        super(config);
    }

    start() {
        if (this.running) return
        super.start();
        this.perform(0)
    }

    stop() {
        super.stop()
        if (this.frame !== null) {
            cancelAnimationFrame(this.frame)
        }
    }

    cycle(dt: number) {
        this.frame = requestAnimationFrame((time) => {
            this.perform(time)
            this.frame = null
        });
    }
}